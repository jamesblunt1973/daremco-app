import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PreloadAllModules, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'catalog',
                pathMatch: 'full'
            },
            {
                path: 'catalog',
                loadChildren: () => import('./catalog/catalog.module').then(m => m.CatalogModule)
            },
            {
                path: 'joola',
                loadChildren: () => import('./joola/joola.module').then(m => m.JoolaModule)
            }
        ]
    }
];

@NgModule({
    declarations: [AppComponent, LayoutComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot({
            useSetInputAPI: true
        }),
        RouterModule.forRoot(routes, {
            preloadingStrategy: PreloadAllModules,
            bindToComponentInputs: true
        }),
        IonicStorageModule.forRoot()
    ],
    providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
    bootstrap: [AppComponent]
})
export class AppModule {}
