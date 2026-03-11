import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PreloadAllModules, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout';
import { authInterceptor } from './shared/services/auth-interceptor';
import { authGuard } from './shared/services/auth.guard';

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
                path: 'auth',
                loadChildren: () => import('./auth/auth.module').then(mod => mod.AuthModule)
            },
            {
                path: 'catalog',
                loadChildren: () => import('./catalog/catalog.module').then(m => m.CatalogModule)
            },
            {
                path: 'joola',
                loadChildren: () => import('./joola/joola.module').then(m => m.JoolaModule),
                canActivate: [authGuard]
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
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideHttpClient(withInterceptors([authInterceptor]))
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
