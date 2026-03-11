import { BulkType } from './bulk-type';
import { Plan } from './plan';
import { ProductColor } from './product-color';
import { ProductType } from './product-type';

export interface Product {
    id: number;
    categoryId: number;
    galleryId: number;
    colorsCount: number;
    discount: number;
    moghat: number;
    name: string;
    tiesHeight: number;
    tiesWidth: number;
    productTypes: ProductType[] | null;
    bulkTypes: BulkType[] | null;
    images: Record<string, string>;
    paletteId: number | null;
    plans: Plan[] | null;
    colors: ProductColor[] | null;
    attributeIds: number[] | null;
    createDate: Date;
    freePlans: boolean;
    layoutId: number;
    ownerId: number;
    rate: number;
    rateNum: number;
    showDescription: string;
    skein: boolean;
    visible: boolean;
}
