import { Component, inject, OnInit } from '@angular/core';
import { MenuController, isPlatform } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.html',
    styleUrl: './layout.scss',
    standalone: false
})
export class LayoutComponent implements OnInit {
    public showExit = false;
    
    private readonly menuController = inject(MenuController) 

    public ngOnInit(): void {
        this.showExit = isPlatform('capacitor');
    }

    public async exit(): Promise<void> {
        await App.exitApp();
    }

    public async closeMenu(): Promise<void> {
        await this.menuController.close();
    }
}
