import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PreloadAllModules, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule, Storage } from '@ionic/storage-angular';
import { AppComponent } from './app.component';
import { LayoutComponent } from './shared/components/layout/layout';
import { AppBootstrapService } from './shared/services/app-bootstrap.service';
import { authInterceptor } from './shared/services/auth-interceptor';
import { authGuard } from './shared/services/auth.guard';

const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(mod => mod.AuthModule)
    },
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
                loadChildren: () => import('./joola/joola.module').then(m => m.JoolaModule),
                canActivate: [authGuard]
            },
            {
                path: 'contact',
                loadComponent: () =>
                    import('./shared/components/contact/contact').then(c => c.ContactComponent)
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
        provideHttpClient(withInterceptors([authInterceptor])),
        provideAppInitializer(() => {
            const storage = inject(Storage);
            const appBootstrap = inject(AppBootstrapService);
            return (async (): Promise<void> => {
                await appBootstrap.bootstrap();
                await storage.create();
            })();
        })
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
