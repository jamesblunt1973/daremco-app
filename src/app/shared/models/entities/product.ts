import { BulkType } from './bulkType';
import { ProductType } from './productType';

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
    ProductTypes: ProductType[];
    BulkTypes: BulkType[];
    ImageData: string;
}
