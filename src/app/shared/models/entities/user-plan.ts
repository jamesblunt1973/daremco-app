import { User } from './user';

export interface UserPlan {
    id: number;
    userId: number;
    productId: number;
    raj: number;
    turned: boolean;
    addDateTime: Date;
    lastAccess: Date;
    position: number;
    finished: boolean;
    playSound: boolean;
    autoPlay: boolean;
    speed: number;
    user: User;
    product: JoolaProduct;
    data: number[];
}

export interface JoolaProduct {
    id: number;
    name: string;
    tiesWidth: number;
    tiesHeight: number;
    colorsCount: number;
    moghat: number;
    Images: Record<string, string>;
}
