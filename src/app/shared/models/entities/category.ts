import { Gallery } from './gallery';

export interface Category {
    Id: number;
    Name: string;
    Galleries: Gallery[];
}
