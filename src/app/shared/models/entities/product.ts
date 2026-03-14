import { BulkType } from './bulk-type';
import { Plan } from './plan';
import { ProductColor } from './product-color';
import { ProductType } from './product-type';

export interface Product {
    Id: number;
    GalleryId: number;
    ColorsCount: number;
    Moghat: number;
    Name: string;
    TiesHeight: number;
    TiesWidth: number;
    ProductTypes: ProductType[] | null;
    BulkTypes: BulkType[] | null;
    Images: Record<string, string>;
    PaletteId: number | null;
    Plans: Plan[] | null;
    Colors: ProductColor[] | null;
    AttributeIds: number[] | null;
}
