import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
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

    public tie = '';
    public timeout = 0;
    public readonly raj = signal(0);
    public readonly color = signal(0);
    public readonly playDisabled = signal(false);
    public readonly position = signal(0);
    public readonly autoPlay = signal(false);
    public readonly speed = signal(0);
    public readonly playSound = signal(false);

    private timeoutId: number | null = null;
    private readonly route = inject(ActivatedRoute);
    private readonly joolaService = inject(JoolaService);
    private readonly alertController = inject(AlertController);
    private readonly toastController = inject(ToastController);
    private readonly destroyRef = inject(DestroyRef);
    private readonly router = inject(Router);

    public constructor() {
        effect(() => {
            const position = this.position();
            const autoPlay = this.autoPlay();
            const speed = this.speed();
            const playSound = this.playSound();

            const userPlan = this.userPlan;
            if (!userPlan) {
                return;
            }

            // Skip when signals already match userPlan (e.g. just initialized from it)
            if (
                userPlan.position === position &&
                userPlan.autoPlay === autoPlay &&
                userPlan.speed === speed &&
                userPlan.playSound === playSound
            ) {
                return;
            }

            userPlan.position = position;
            userPlan.autoPlay = autoPlay;
            userPlan.speed = speed;
            userPlan.playSound = playSound;

            void this.joolaService.savePreferences(userPlan);
        });
    }

    public ngOnInit(): void {
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
            const userPlanId = Number(params.get('id'));
            this.userPlan =
                this.joolaService.userPlans.value().find(plan => plan.id === userPlanId) ?? null;

            if (!this.userPlan || !this.userPlan.data) {
                void this.router.navigate(['joola']);
                return;
            }

            this.position.set(this.userPlan.position);
            this.autoPlay.set(this.userPlan.autoPlay);
            this.speed.set(this.userPlan.speed);
            this.playSound.set(this.userPlan.playSound);

            this.extractPosition();
        });
    }

    public changeAutoplay(): void {
        if (!this.userPlan) {
            return;
        }

        if (this.autoPlay()) {
            this.playDisabled.set(false);
            this.clearAutoplayTimeout();
            this.timeout = 0;
        }

        this.autoPlay.update(value => !value);
    }

    public async reset(): Promise<void> {
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
            this.playDisabled.set(false);
            this.autoPlay.set(false);
            this.position.set(0);
            this.extractPosition();
        }
    }

    public async next(playGereh = false): Promise<void> {
        this.timeout = 0;
        this.playDisabled.set(true);

        const data = this.userPlan!.data;
        let position = this.position() + 1;
        const element = data[position];

        if (element === -1) {
            position++;
            this.raj.set(data[position]);
            this.position.set(position);
            await this.playAudio('raj');
            await this.playNumber(this.raj());
            await this.next();
        } else if (element === -2) {
            position++;
            this.color.set(data[position]);
            this.position.set(position);
            await this.playAudio('rang');
            await this.playNumber(this.color());
            await this.next(true);
        } else {
            let nextElement: number | null = null;
            this.tie = element.toString();

            if (playGereh) {
                await this.playAudio('gereh');
            }

            await this.playNumber(element);
            let tiesCount = 1;

            if (data[position + 1] === -3) {
                position += 2;
                nextElement = data[position];
                this.tie += ` - ${nextElement}`;
                await this.playAudio('ela');
                await this.playNumber(nextElement);
                tiesCount = nextElement - element + 1;
            }

            this.position.set(position);
            this.playDisabled.set(false);

            if (this.autoPlay() && !playGereh) {
                this.playDisabled.set(true);
                const time = 60 / this.speed();
                this.timeout = tiesCount * time * 1000;
                this.timeoutId = window.setTimeout(() => {
                    void this.next();
                }, this.timeout);
            }
        }
    }

    public nextTie(): void {
        const data = this.userPlan!.data;
        let position = this.position();
        let next = data[position + 1];
        if (next === -1) {
            void this.showWarningSnack('پایان رج');
            return;
        }

        if (next === -2) {
            void this.showWarningSnack('پایان رنگ');
            return;
        }

        position++;
        this.tie = next.toString();
        next = data[position + 1];
        if (next === -3) {
            position += 2;
            next = data[position];
            this.tie += ` - ${next}`;
        }

        this.position.set(position);
    }

    public previousTie(): void {
        const data = this.userPlan!.data;
        const currentPosition = this.position();
        let previousIndex = 1;
        const newPosition = currentPosition - previousIndex;

        if (newPosition === 0) {
        }

        let previous1 = data[newPosition];
        if (previous1 === -3) {
            previousIndex = 3;
            previous1 = data[newPosition];
        }

        const previous2 = data[newPosition - 1];
        if (previous2 === -1) {
            void this.showWarningSnack('ابتدای رج');
            return;
        }

        if (previous2 === -2) {
            void this.showWarningSnack('ابتدای رنگ');
            return;
        }

        this.tie = previous1.toString();
        if (previous2 === -3) {
            this.tie = `${data[newPosition - 2]} - ${previous1}`;
        }

        this.position.set(newPosition);
    }

    public nextColor(): void {
        const data = this.userPlan!.data;
        let position = this.position();
        while (position < data.length) {
            position++;
            const next = data[position];
            if (next === -1) {
                void this.showWarningSnack('انتهای رج');
                break;
            }

            if (next === -2) {
                const newPosition = position + 1;
                this.position.set(newPosition);
                this.color.set(data[newPosition]);
                this.nextTie();
                break;
            }
        }
    }

    public prevColor(): void {
        const data = this.userPlan!.data;
        let position = this.position();
        while (position > 0) {
            position--;
            const previous = data[position];
            if (previous === -1) {
                void this.showWarningSnack('ابتدای رج');
                break;
            }

            if (previous === -2) {
                const color = data[position + 1];
                if (this.color() === color) {
                    continue;
                }

                this.position.set(position + 1);
                this.color.set(color);
                this.nextTie();
                break;
            }
        }
    }

    public nextRaj(): void {
        const data = this.userPlan!.data;
        let position = this.position();
        while (position < data.length) {
            position++;
            if (position === data.length) {
                void this.showWarningSnack('پایان نقشه');
                break;
            }

            const next = data[position];
            if (next === -1) {
                const newPosition = position + 1;
                this.position.set(newPosition);
                this.raj.set(data[newPosition]);
                this.nextColor();
                break;
            }
        }
    }

    public prevRaj(): void {
        const data = this.userPlan!.data;
        let position = this.position();
        while (position > 0) {
            position--;
            const previous = data[position];
            if (previous === -1) {
                const raj = data[position + 1];
                if (this.raj() === raj) {
                    continue;
                }

                this.position.set(position + 1);
                this.raj.set(raj);
                this.nextColor();
                break;
            }
        }
    }

    public changeRaj(): void {
        if (this.raj() <= 0) {
            void this.showErrorSnack('عدد وارد شده نباید کوچکتر یا مساوی صفر باشد.');
            this.extractPosition();
            return;
        }

        if (this.raj() > this.userPlan!.product.tiesHeight) {
            void this.showErrorSnack(
                `عدد وارد شده باید کوچکتر یا مساوی ${this.userPlan!.product.tiesHeight} باشد.`
            );
            this.extractPosition();
            return;
        }

        const data = this.userPlan!.data;
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            const nextElement = data[i + 1];
            if (element === -1 && nextElement === this.raj()) {
                this.applyPosition(i, 0, 0);
                break;
            }
        }
    }

    public changeColor(): void {
        if (this.color() <= 0) {
            void this.showErrorSnack('عدد وارد شده نباید کوچکتر یا مساوی صفر باشد.');
            this.extractPosition();
            return;
        }

        if (this.color() > this.userPlan!.product.colorsCount) {
            void this.showErrorSnack(
                `عدد وارد شده باید کوچکتر یا مساوی ${this.userPlan!.product.colorsCount} باشد.`
            );
            this.extractPosition();
            return;
        }

        const data = this.userPlan!.data;
        let i = this.position();
        let element = data[i];
        while (element !== -1) {
            i--;
            element = data[i];
            if (element === -2 && data[i + 1] === this.color()) {
                this.applyPosition(i, this.raj(), 0);
                return;
            }
        }

        i = this.position();
        element = data[i];
        while (i < data.length && element !== -1) {
            i++;
            element = data[i];
            if (element === -2 && data[i + 1] === this.color()) {
                this.applyPosition(i, this.raj(), 0);
                return;
            }
        }

        void this.showErrorSnack('شماره رنگ وارد شده در این رج بکار نرفته است');
        this.extractPosition();
    }

    public changeTie(): void {
        const tie = Number(this.tie);
        if (Number.isNaN(tie) || tie <= 0 || tie > this.userPlan!.product.tiesWidth) {
            void this.showErrorSnack(
                `لطفا یک عدد بین یک و ${this.userPlan!.product.tiesWidth} وارد نمایید.`
            );
            this.extractPosition();
            return;
        }

        const data = this.userPlan!.data;
        let i = this.position();
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
                    this.position.set(i);
                    this.extractPosition();
                    break;
                }
            } else if (element === tie) {
                this.position.set(i);
                this.extractPosition();
                break;
            }
        } while (element !== -1);
    }

    private extractPosition(): void {
        // position نباید تغییر کند،
        // همیشه روی گره دوم ذخیره می‌شود
        this.raj.set(0);
        this.color.set(0);
        this.tie = '';

        if (this.position() === 0) {
            this.position.set(-1);
            void this.next();
            return;
        }

        const data = this.userPlan!.data;

        for (let i = this.position(); i >= 0; i--) {
            const element = data[i];
            const nextElement = data[i + 1];
            if (element === -1 && !this.raj()) {
                this.raj.set(nextElement);
            } else if (element === -2 && !this.color()) {
                this.color.set(nextElement);
            }

            if (this.raj() && this.color()) {
                break;
            }
        }

        const currentPosition = this.position();
        this.tie = data[currentPosition].toString();
        if (data[currentPosition - 1] === -3) {
            this.tie = `${data[currentPosition - 2]} - ${this.tie}`;
        }
    }

    private applyPosition(position: number, raj: number, color: number): void {
        // در اینجا پوزیشن به ابتدای رج یا ابتدای رنگ اشاره دارد و باید به موقعیت صحیح منتقل شود
        // یعنی روی گره دوم
        this.raj.set(raj);
        this.color.set(color);
        this.tie = '';

        const data = this.userPlan!.data;
        let nextPosition = position;
        while (nextPosition < data.length) {
            const element = data[nextPosition];
            const nextElement = data[nextPosition + 1];
            if (element === -1 && !this.raj()) {
                this.raj.set(nextElement);
                nextPosition += 2;
                continue;
            } else if (element === -2 && !this.color()) {
                this.color.set(nextElement);
                nextPosition += 2;
                continue;
            }

            if (this.raj() && this.color()) {
                break;
            }

            nextPosition++;
        }

        this.tie = data[nextPosition].toString();
        if (data[nextPosition + 1] === -3) {
            nextPosition += 2;
            this.tie += ` - ${data[nextPosition]}`;
        }

        this.position.set(nextPosition);
    }

    private playAudio(fileName: string): Promise<void> {
        return new Promise(resolve => {
            if (!this.playSound()) {
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
