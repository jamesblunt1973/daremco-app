import {
    effect,
    inject,
    Injectable,
    Injector,
    resource,
    ResourceRef,
    runInInjectionContext
} from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Category, Endpoints, PrimaryData, Product } from '../models';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    public categories = resource<Category[], unknown>({
        loader: () => this.storage.get(Endpoints.categories),
        defaultValue: []
    });

    public products = resource<Product[], unknown>({
        loader: () => this.storage.get(Endpoints.products),
        defaultValue: []
    });

    public primaryData = resource<PrimaryData, unknown>({
        loader: () => this.storage.get(Endpoints.primaryData)
    });

    public mostUsedlinks = resource<string, unknown>({
        loader: () => this.storage.get(Endpoints.mostUsedlinks),
        defaultValue: ''
    });

    private storage = inject(Storage);
    private injector = inject(Injector);

    public reload = (): void => {
        this.categories.reload();
        this.products.reload();
        this.primaryData.reload();
        this.mostUsedlinks.reload();
    };

    public hasCoreData = async (): Promise<boolean> => {
        try {
            const categoriesStatus = this.categories.status();
            const productsStatus = this.products.status();
            const primaryDataStatus = this.primaryData.status();

            if (categoriesStatus === 'loading') {
                await this.waitFor(this.categories);
            }
            if (productsStatus === 'loading') {
                await this.waitFor(this.products);
            }
            if (primaryDataStatus === 'loading') {
                await this.waitFor(this.primaryData);
            }

            const hasCategories = categoriesStatus !== 'error' && this.categories.hasValue();
            const hasProducts = productsStatus !== 'error' && this.products.hasValue();
            const hasPrimaryData =
                primaryDataStatus !== 'error' &&
                this.primaryData.hasValue() &&
                Object.keys(this.primaryData.value()).length > 0;

            return hasCategories && hasProducts && hasPrimaryData;
        } catch {
            return false;
        }
    };

    private waitFor(resource: ResourceRef<unknown>): Promise<void> {
        return new Promise(resolve => {
            runInInjectionContext(this.injector, () => {
                const ref = effect(() => {
                    if (!resource.isLoading()) {
                        ref.destroy();
                        resolve();
                    }
                });
            });
        });
    }
}
