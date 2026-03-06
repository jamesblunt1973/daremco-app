import { Gallery } from './gallery';

export interface Category {
    id: number;
    name: string;
    galleries: Gallery[];
}
