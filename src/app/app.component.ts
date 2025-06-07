/* eslint-disable @typescript-eslint/no-misused-promises */
import { Component, inject } from '@angular/core';
import { App } from '@capacitor/app';
import { Platform, ToastController } from '@ionic/angular';

declare global {
    interface Navigator {
        app: {
            exitApp: () => void;
        };
    }
}

@Component({
    selector: 'app-root',
    template: `
        <ion-app>
            <ion-router-outlet></ion-router-outlet>
        </ion-app>`,
    standalone: false
})
export class AppComponent {
    private lastTimeBackPressed = 0;
    private timePeriodToExit = 1500;
    private platform = inject(Platform);
    private toastController = inject(ToastController);

    public constructor() {
        this.platform.ready().then(
            () => {
                void this.backButtonEvent();
            },
            (error: unknown) => {
                throw error;
            }
        );
    }

    public async backButtonEvent(): Promise<void> {
        await App.addListener('backButton', async (): Promise<void> => {
            const currentTime = new Date().getTime();

            if (currentTime - this.lastTimeBackPressed < this.timePeriodToExit) {
                await App.exitApp();
            } else {
                this.lastTimeBackPressed = currentTime;
                const toast = await this.toastController.create({
                    message: 'Press back again to exit',
                    duration: this.timePeriodToExit,
                    position: 'bottom'
                });
                await toast.present();
            }
        });
    }
}
