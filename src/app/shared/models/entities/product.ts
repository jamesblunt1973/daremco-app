import { BulkType } from './bulk-type';
import { ProductType } from './product-type';

export interface Product {
    Id: number;
    CategoryId: number;
    GalleryId: number;
    ColorsCount: number;
    Discount: number;
    Moghat: number;
    Name: string;
    TiesHeight: number;
    TiesWidth: number;
    ProductTypes: ProductType[] | null;
    BulkTypes: BulkType[] | null;
    ImageData: string;
    PaletteId: number | null;
}
