import { Component, OnInit } from '@angular/core';
import { isPlatform } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.html',
    styleUrl: './layout.scss',
    standalone: false
})
export class LayoutComponent implements OnInit {
    public showExit = false;

    public ngOnInit(): void {
        this.showExit = isPlatform('capacitor');
    }

    public async exit(): Promise<void> {
        await App.exitApp();
    }
}
