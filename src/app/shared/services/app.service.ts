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
    public messageHistory = signal<string[]>([]);
    public message = signal<string>('');
    public serverAvailable = signal(false);

    public setMessage(message: string): void {
        this.message.set(message);
        if (!message) {
            return;
        }
        this.messageHistory.update(messages => [...messages, message]);
    }
}
