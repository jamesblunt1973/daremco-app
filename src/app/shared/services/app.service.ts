import { Injectable, signal } from '@angular/core';
import { ServerStatus } from '../models/types/server-status';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    public serverStatus = signal<ServerStatus>('Unknown');
    public productsCount = signal<number>(0);
    public isUpdating = signal<string>('');
    public isInitializing = signal<boolean>(true);
    public message = signal<string>('');
}
