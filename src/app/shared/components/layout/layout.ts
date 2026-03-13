import { Component, inject, OnInit } from '@angular/core';
import { App } from '@capacitor/app';
import { isPlatform, MenuController } from '@ionic/angular';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.html',
    styleUrl: './layout.scss',
    standalone: false
})
export class LayoutComponent implements OnInit {
    public isApp = false;

    private readonly menuController = inject(MenuController);

    public ngOnInit(): void {
        this.isApp = isPlatform('capacitor');
    }

    public async exit(): Promise<void> {
        await App.exitApp();
    }

    public async closeMenu(): Promise<void> {
        await this.menuController.close();
    }
}
