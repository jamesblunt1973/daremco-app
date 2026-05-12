import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { UserPlan } from '../../shared/models';
import { JoolaService } from '../../shared/services/joola.service';
import { WeaveScript, WeaveUnit } from './weave-script';

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

    private script: WeaveScript | null = null;
    // -1 means "no unit selected yet" (fresh plan, before the first next()).
    private unitIndex = -1;
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

            this.script = new WeaveScript(this.userPlan.data);
            this.autoPlay.set(this.userPlan.autoPlay);
            this.speed.set(this.userPlan.speed);
            this.playSound.set(this.userPlan.playSound);

            // Restore unitIndex from the persisted raw position. position 0
            // (or anything we can't map back to a unit) means "fresh start" —
            // kick off next() so the first unit is selected and announced.
            const restored =
                this.userPlan.position === 0
                    ? -1
                    : this.script.indexOfPosition(this.userPlan.position);
            this.unitIndex = restored;

            if (this.unitIndex < 0) {
                this.position.set(0);
                void this.next();
            } else {
                this.syncToUnit(this.script.unitAt(this.unitIndex));
            }
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
                { text: 'خیر', role: 'cancel' },
                { text: 'بله', role: 'confirm' }
            ]
        });

        await alert.present();
        const { role } = await alert.onDidDismiss();
        if (role !== 'confirm') {
            return;
        }

        this.clearAutoplayTimeout();
        this.timeout = 0;
        this.playDisabled.set(false);
        this.autoPlay.set(false);
        this.unitIndex = -1;
        this.syncToUnit(null);
        void this.next();
    }

    public async next(playGereh = false): Promise<void> {
        if (!this.script) {
            return;
        }

        this.timeout = 0;
        this.playDisabled.set(true);

        const prev = this.script.unitAt(this.unitIndex);
        const target = this.script.unitAt(this.unitIndex + 1);
        if (!target) {
            this.playDisabled.set(false);
            void this.showWarningSnack('پایان نقشه');
            return;
        }

        this.unitIndex++;

        const rajChanged = !prev || prev.raj !== target.raj;
        const colorChanged = !prev || prev.color !== target.color;

        if (rajChanged) {
            this.raj.set(target.raj);
            await this.playAudio('raj');
            await this.playNumber(target.raj);
        }
        if (colorChanged) {
            this.color.set(target.color);
            await this.playAudio('rang');
            await this.playNumber(target.color);
        }

        const announceGereh = playGereh || colorChanged;
        if (announceGereh) {
            await this.playAudio('gereh');
        }

        await this.playNumber(target.tieStart);
        if (target.isInterval) {
            await this.playAudio('ela');
            await this.playNumber(target.tieEnd);
        }

        this.syncToUnit(target);
        this.playDisabled.set(false);

        if (this.autoPlay() && !announceGereh) {
            const tiesCount = target.tieEnd - target.tieStart + 1;
            this.playDisabled.set(true);
            const time = 60 / this.speed();
            this.timeout = tiesCount * time * 1000;
            this.timeoutId = window.setTimeout(() => void this.next(), this.timeout);
        }
    }

    public nextTie(): void {
        if (!this.script) {
            return;
        }

        const cur = this.script.unitAt(this.unitIndex);
        const target = this.script.unitAt(this.unitIndex + 1);
        if (!target) {
            void this.showWarningSnack(cur ? 'پایان رج' : 'پایان نقشه');
            return;
        }
        if (cur && target.raj !== cur.raj) {
            void this.showWarningSnack('پایان رج');
            return;
        }
        if (cur && target.color !== cur.color) {
            void this.showWarningSnack('پایان رنگ');
            return;
        }

        this.unitIndex++;
        this.syncToUnit(target);
    }

    public previousTie(): void {
        if (!this.script) {
            return;
        }

        const cur = this.script.unitAt(this.unitIndex);
        const target = this.script.unitAt(this.unitIndex - 1);
        if (!cur || !target) {
            // First unit (or nothing selected) is by definition the start of
            // the first color of the first raj.
            void this.showWarningSnack('ابتدای رنگ');
            return;
        }
        if (target.raj !== cur.raj) {
            void this.showWarningSnack('ابتدای رج');
            return;
        }
        if (target.color !== cur.color) {
            void this.showWarningSnack('ابتدای رنگ');
            return;
        }

        this.unitIndex--;
        this.syncToUnit(target);
    }

    public nextColor(): void {
        this.jumpTo(this.script?.nextColor(this.unitIndex), 'انتهای رج');
    }

    public prevColor(): void {
        this.jumpTo(this.script?.prevColor(this.unitIndex), 'ابتدای رج');
    }

    public nextRaj(): void {
        this.jumpTo(this.script?.nextRaj(this.unitIndex), 'پایان نقشه');
    }

    public prevRaj(): void {
        this.jumpTo(this.script?.prevRaj(this.unitIndex), 'ابتدای نقشه');
    }

    public changeRaj(): void {
        if (!this.script || !this.userPlan) {
            return;
        }

        if (this.raj() <= 0) {
            void this.showErrorSnack('عدد وارد شده نباید کوچکتر یا مساوی صفر باشد.');
            this.syncToUnit(this.currentUnit());
            return;
        }
        if (this.raj() > this.userPlan.product.tiesHeight) {
            void this.showErrorSnack(
                `عدد وارد شده باید کوچکتر یا مساوی ${this.userPlan.product.tiesHeight} باشد.`
            );
            this.syncToUnit(this.currentUnit());
            return;
        }

        const target = this.script.findRaj(this.raj());
        if (!target) {
            void this.showErrorSnack('این رج در نقشه یافت نشد.');
            this.syncToUnit(this.currentUnit());
            return;
        }
        this.jumpTo(target);
    }

    public changeColor(): void {
        if (!this.script || !this.userPlan) {
            return;
        }

        if (this.color() <= 0) {
            void this.showErrorSnack('عدد وارد شده نباید کوچکتر یا مساوی صفر باشد.');
            this.syncToUnit(this.currentUnit());
            return;
        }
        if (this.color() > this.userPlan.product.colorsCount) {
            void this.showErrorSnack(
                `عدد وارد شده باید کوچکتر یا مساوی ${this.userPlan.product.colorsCount} باشد.`
            );
            this.syncToUnit(this.currentUnit());
            return;
        }

        const target = this.script.findColorInRaj(this.raj(), this.color());
        if (!target) {
            void this.showErrorSnack('شماره رنگ وارد شده در این رج بکار نرفته است');
            this.syncToUnit(this.currentUnit());
            return;
        }
        this.jumpTo(target);
    }

    public changeTie(): void {
        if (!this.script || !this.userPlan) {
            return;
        }

        const tie = Number(this.tie);
        if (Number.isNaN(tie) || tie <= 0 || tie > this.userPlan.product.tiesWidth) {
            void this.showErrorSnack(
                `لطفا یک عدد بین یک و ${this.userPlan.product.tiesWidth} وارد نمایید.`
            );
            this.syncToUnit(this.currentUnit());
            return;
        }

        const target = this.script.findTieInRaj(this.raj(), tie);
        if (!target) {
            void this.showErrorSnack('این گره در رج فعلی یافت نشد.');
            this.syncToUnit(this.currentUnit());
            return;
        }
        this.jumpTo(target);
    }

    private jumpTo(target: WeaveUnit | null | undefined, missingMessage?: string): void {
        if (!this.script) {
            return;
        }
        if (!target) {
            if (missingMessage) {
                void this.showWarningSnack(missingMessage);
            }
            return;
        }
        this.unitIndex = this.script.indexOfPosition(target.position);
        this.syncToUnit(target);
    }

    private currentUnit(): WeaveUnit | null {
        return this.script?.unitAt(this.unitIndex) ?? null;
    }

    /**
     * Single point that mirrors a unit into the visible signals + persisted
     * `position`. Passing `null` resets to the "nothing selected" state.
     */
    private syncToUnit(unit: WeaveUnit | null): void {
        if (!unit) {
            this.raj.set(0);
            this.color.set(0);
            this.tie = '';
            this.position.set(0);
            return;
        }
        this.raj.set(unit.raj);
        this.color.set(unit.color);
        this.tie = unit.isInterval
            ? `${unit.tieStart} - ${unit.tieEnd}`
            : `${unit.tieStart}`;
        this.position.set(unit.position);
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
        for (const fileName of this.getNumberDigits(num)) {
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
