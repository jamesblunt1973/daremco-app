import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { UserPlan } from '../../shared/models';
import { JoolaService } from '../../shared/services/joola.service';

@Component({
    selector: 'app-waeve',
    templateUrl: './waeve.html',
    styleUrl: './waeve.scss',
    standalone: false
})
export class WaeveComponent implements OnInit {
    public loadingMsg = '';
    public userPlan: UserPlan | null = null;
    public productsPath = JoolaService.productsPath;
    public tieSearchFocus = false;
    public colorSearchFocus = false;
    public rajSearchFocus = false;

    public raj = 0;
    public color = 0;
    public tie = '';
    public position = 0;
    public playDisabled = false;
    public timeout = 0;

    private timeoutId: number | null = null;
    private readonly route = inject(ActivatedRoute);
    private readonly joolaService = inject(JoolaService);
    private readonly alertController = inject(AlertController);
    private readonly toastController = inject(ToastController);
    private readonly destroyRef = inject(DestroyRef);
    private readonly router = inject(Router);

    public ngOnInit(): void {
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
            const userPlanId = Number(params.get('id'));
            if (!Number.isFinite(userPlanId) || userPlanId <= 0) {
                this.userPlan = null;
                return;
            }

            this.userPlan =
                this.joolaService.userPlans.value().find(plan => plan.id === userPlanId) ?? null;

            if (!this.userPlan || !this.userPlan.data) {
                void this.router.navigate(['joola']);
            }
        });
    }

    public changeAutoplay(): void {
        if (!this.userPlan) {
            return;
        }

        if (this.userPlan.autoPlay) {
            this.playDisabled = false;
            this.clearAutoplayTimeout();
            this.timeout = 0;
        }

        this.userPlan.autoPlay = !this.userPlan.autoPlay;
    }

    public async reset(): Promise<void> {
        const userPlan = this.userPlan;
        if (!userPlan) {
            return;
        }

        const alert = await this.alertController.create({
            header: '',
            message: 'آیا می‌خواهید از ابتدا شروع کنید؟',
            buttons: [
                {
                    text: 'خیر',
                    role: 'cancel'
                },
                {
                    text: 'بله',
                    role: 'confirm'
                }
            ]
        });

        await alert.present();
        const { role } = await alert.onDidDismiss();
        if (role === 'confirm') {
            this.clearAutoplayTimeout();
            this.timeout = 0;
            this.playDisabled = false;
            userPlan.autoPlay = false;
            userPlan.position = 0;
            this.extractPosition(0);
        }
    }

    public async next(playGereh = false): Promise<void> {
        const userPlan = this.userPlan;
        if (!userPlan) {
            return;
        }

        this.timeout = 0;
        this.playDisabled = true;

        const data = userPlan.data;
        this.position++;
        const element = data[this.position];

        if (element === -1) {
            this.position++;
            this.raj = data[this.position];
            await this.playAudio('raj');
            await this.playNumber(this.raj);
            await this.next();
        } else if (element === -2) {
            this.position++;
            this.color = data[this.position];
            await this.playAudio('rang');
            await this.playNumber(this.color);
            await this.next(true);
        } else {
            let nextElement: number | null = null;
            this.tie = element.toString();

            if (playGereh) {
                await this.playAudio('gereh');
            }

            await this.playNumber(element);
            let tiesCount = 1;

            if (data[this.position + 1] === -3) {
                this.position += 2;
                nextElement = data[this.position];
                this.tie += ` - ${nextElement}`;
                await this.playAudio('ela');
                await this.playNumber(nextElement);
                tiesCount = nextElement - element + 1;
            }

            this.playDisabled = false;

            if (userPlan.autoPlay && !playGereh) {
                this.playDisabled = true;
                const time = 60 / userPlan.speed;
                this.timeout = tiesCount * time * 1000;
                this.timeoutId = window.setTimeout(() => {
                    void this.next();
                }, this.timeout);
            }
        }

        userPlan.position = this.position;
    }

    public nextTie(): void {
        const userPlan = this.userPlan;
        if (!userPlan) {
            return;
        }

        const data = userPlan.data;
        let next = data[this.position + 1];
        if (next === -1) {
            void this.showWarningSnack('پایان رج');
            return;
        }

        if (next === -2) {
            void this.showWarningSnack('پایان رنگ');
            return;
        }

        this.position++;
        this.tie = next.toString();
        next = data[this.position + 1];
        if (next === -3) {
            this.position += 2;
            next = data[this.position];
            this.tie += ` - ${next}`;
        }

        userPlan.position = this.position;
    }

    public previousTie(): void {
        const userPlan = this.userPlan;
        if (!userPlan) {
            return;
        }

        const data = userPlan.data;
        let previousIndex = 1;
        let previous1 = data[this.position - previousIndex];
        if (previous1 === -3) {
            previousIndex = 3;
            previous1 = data[this.position - previousIndex];
        }

        const previous2 = data[this.position - previousIndex - 1];
        if (previous2 === -1) {
            void this.showWarningSnack('ابتدای رج');
            return;
        }

        if (previous2 === -2) {
            void this.showWarningSnack('ابتدای رنگ');
            return;
        }

        this.position -= previousIndex;
        this.tie = previous1.toString();
        if (previous2 === -3) {
            this.tie = `${data[this.position - 2]} - ${previous1}`;
        }

        userPlan.position = this.position;
    }

    public nextColor(): void {
        const userPlan = this.userPlan;
        if (!userPlan) {
            return;
        }

        const data = userPlan.data;
        let position = this.position;
        while (position < data.length) {
            position++;
            const next = data[position];
            if (next === -1) {
                void this.showWarningSnack('انتهای رج');
                break;
            }

            if (next === -2) {
                this.position = position + 1;
                this.color = data[this.position];
                this.nextTie();
                break;
            }
        }
    }

    public prevColor(): void {
        const userPlan = this.userPlan;
        if (!userPlan) {
            return;
        }

        const data = userPlan.data;
        let position = this.position;
        while (position > 0) {
            position--;
            const previous = data[position];
            if (previous === -1) {
                void this.showWarningSnack('ابتدای رج');
                break;
            }

            if (previous === -2) {
                const color = data[position + 1];
                if (this.color === color) {
                    continue;
                }

                this.position = position + 1;
                this.color = color;
                this.nextTie();
                break;
            }
        }
    }

    public nextRaj(): void {
        const userPlan = this.userPlan;
        if (!userPlan) {
            return;
        }

        const data = userPlan.data;
        let position = this.position;
        while (position < data.length) {
            position++;
            if (position === data.length) {
                void this.showWarningSnack('پایان نقشه');
                break;
            }

            const next = data[position];
            if (next === -1) {
                this.position = position + 1;
                this.raj = data[this.position];
                this.nextColor();
                break;
            }
        }
    }

    public prevRaj(): void {
        const userPlan = this.userPlan;
        if (!userPlan) {
            return;
        }

        const data = userPlan.data;
        let position = this.position;
        while (position > 0) {
            position--;
            const previous = data[position];
            if (previous === -1) {
                const raj = data[position + 1];
                if (this.raj === raj) {
                    continue;
                }

                this.position = position + 1;
                this.raj = raj;
                this.nextColor();
                break;
            }
        }
    }

    public changeRaj(): void {
        const userPlan = this.userPlan;
        if (!userPlan) {
            return;
        }

        if (this.raj <= 0) {
            void this.showErrorSnack('عدد وارد شده نباید کوچکتر یا مساوی صفر باشد.');
            this.extractPosition(this.position);
            return;
        }

        if (this.raj > userPlan.product.tiesHeight) {
            void this.showErrorSnack(
                `عدد وارد شده باید کوچکتر یا مساوی ${userPlan.product.tiesHeight} باشد.`
            );
            this.extractPosition(this.position);
            return;
        }

        const data = userPlan.data;
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            const nextElement = data[i + 1];
            if (element === -1 && nextElement === this.raj) {
                this.applyPosition(i, 0, 0);
                break;
            }
        }
    }

    public changeColor(): void {
        const userPlan = this.userPlan;
        if (!userPlan) {
            return;
        }

        if (this.color <= 0) {
            void this.showErrorSnack('عدد وارد شده نباید کوچکتر یا مساوی صفر باشد.');
            this.extractPosition(this.position);
            return;
        }

        if (this.color > userPlan.product.colorsCount) {
            void this.showErrorSnack(
                `عدد وارد شده باید کوچکتر یا مساوی ${userPlan.product.colorsCount} باشد.`
            );
            this.extractPosition(this.position);
            return;
        }

        const data = userPlan.data;
        let i = this.position;
        let element = data[i];
        while (element !== -1) {
            i--;
            element = data[i];
            if (element === -2 && data[i + 1] === this.color) {
                this.applyPosition(i, this.raj, 0);
                return;
            }
        }

        i = this.position;
        element = data[i];
        while (i < data.length && element !== -1) {
            i++;
            element = data[i];
            if (element === -2 && data[i + 1] === this.color) {
                this.applyPosition(i, this.raj, 0);
                return;
            }
        }

        void this.showErrorSnack('شماره رنگ وارد شده در این رج بکار نرفته است');
        this.extractPosition(this.position);
    }

    public changeTie(): void {
        const userPlan = this.userPlan;
        if (!userPlan) {
            return;
        }

        const tie = Number(this.tie);
        if (Number.isNaN(tie) || tie <= 0 || tie > userPlan.product.tiesWidth) {
            void this.showErrorSnack(
                `لطفا یک عدد بین یک و ${userPlan.product.tiesWidth} وارد نمایید.`
            );
            this.extractPosition(this.position);
            return;
        }

        const data = userPlan.data;
        let i = this.position;
        while (data[i] !== -1) {
            i--;
        }

        i++;
        let element: number;
        do {
            i++;
            element = data[i];
            if (element === -2) {
                i++;
                continue;
            }

            const nextElement = data[i + 1];
            if (nextElement === -3) {
                i += 2;
                const lastElement = data[i];
                if (
                    element === tie ||
                    lastElement === tie ||
                    (tie > element && tie < lastElement)
                ) {
                    this.extractPosition(i);
                    break;
                }
            } else if (element === tie) {
                this.extractPosition(i);
                break;
            }
        } while (element !== -1);
    }

    private extractPosition(position: number): void {
        if (!this.userPlan) {
            return;
        }

        // position نباید تغییر کند،
        // همیشه روی گره دوم ذخیره می‌شود
        this.raj = 0;
        this.color = 0;
        this.tie = '';
        this.position = -1;
        this.position = position;

        if (this.position === 0) {
            this.position = -1;
            void this.next();
            return;
        }

        const data = this.userPlan.data;

        for (let i = this.position; i >= 0; i--) {
            const element = data[i];
            const nextElement = data[i + 1];
            if (element === -1 && !this.raj) {
                this.raj = nextElement;
            } else if (element === -2 && !this.color) {
                this.color = nextElement;
            }

            if (this.raj && this.color) {
                break;
            }
        }

        this.tie = data[this.position].toString();
        if (data[this.position - 1] === -3) {
            this.tie = `${data[this.position - 2]} - ${this.tie}`;
        }
    }

    private applyPosition(position: number, raj: number, color: number): void {
        if (!this.userPlan) {
            return;
        }

        // در اینجا پوزیشن به ابتدای رج یا ابتدای رنگ اشاره دارد و باید به موقعیت صحیح منتقل شود
        // یعنی روی گره دوم
        this.raj = raj;
        this.color = color;
        this.tie = '';
        this.position = position;

        const data = this.userPlan.data;
        while (this.position < data.length) {
            const element = data[this.position];
            const nextElement = data[this.position + 1];
            if (element === -1 && !this.raj) {
                this.raj = nextElement;
                this.position += 2;
                continue;
            } else if (element === -2 && !this.color) {
                this.color = nextElement;
                this.position += 2;
                continue;
            }

            if (this.raj && this.color) {
                break;
            }

            this.position++;
        }

        this.tie = data[this.position].toString();
        if (data[this.position + 1] === -3) {
            this.position += 2;
            this.tie += ` - ${data[this.position]}`;
        }
    }

    private playAudio(fileName: string): Promise<void> {
        return new Promise(resolve => {
            if (!this.userPlan?.playSound) {
                resolve();
                return;
            }

            const audio = new Audio();
            audio.onended = (): void | PromiseLike<void> => resolve();
            audio.src = this.joolaService.getAudioUrl(fileName);
            void audio.play();
        });
    }

    private async playNumber(num: number): Promise<void> {
        const digits = this.getNumberDigits(num);
        for (const fileName of digits) {
            await this.playAudio(fileName);
        }
    }

    private getNumberDigits(num: number): string[] {
        if (num < 20) {
            return [`${num}`];
        }

        if (num < 100) {
            if (num % 10 === 0) {
                return [`${num}`];
            }

            const tens = Math.floor(num / 10);
            const ones = num % 10;
            return [`${tens}0_`, `${ones}`];
        }

        if (num < 1000) {
            if (num % 100 === 0) {
                return [`${num}`];
            }

            const hundreds = Math.floor(num / 100);
            const remain = num % 100;
            return [`${hundreds}00_`, ...this.getNumberDigits(remain)];
        }

        const thousand = Math.floor(num / 1000);
        const thousands = thousand === 1 ? [] : [`${thousand}`];
        if (num % 1000 === 0) {
            return [...thousands, '1000'];
        }

        const remain = num % 1000;
        return [...thousands, '1000_', ...this.getNumberDigits(remain)];
    }

    private clearAutoplayTimeout(): void {
        if (this.timeoutId !== null) {
            window.clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    private async showWarningSnack(message: string): Promise<void> {
        const toast = await this.toastController.create({
            message,
            duration: 1500,
            color: 'warning',
            position: 'bottom'
        });
        await toast.present();
    }

    private async showErrorSnack(message: string): Promise<void> {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            color: 'danger',
            position: 'bottom'
        });
        await toast.present();
    }
}
