import { Injectable, signal } from '@angular/core';
import { ServerStatus } from '../models/types/server-status.type';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    public serverStatus = signal<ServerStatus>('Unknown');
    public productsCount = signal<number>(0);
    public missedImages = signal<number>(0);
    public hasImages = signal<number>(0);
    public downloadedImages = signal<number>(0);
    public failedImages = signal<number>(0);
    public isUpdating = signal<boolean>(false);
}
