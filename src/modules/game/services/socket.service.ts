import { inject, Injectable } from '@angular/core';
import { NAKAMA } from '@api/nakama';
import { SessionService } from '@auth/services/session.service';
import { Socket } from '@heroiclabs/nakama-js';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private nakama = inject(NAKAMA);
    private session = inject(SessionService).session;
    private socket!: Socket | null;

    async create() {
        this.socket = this.nakama.createSocket();
        await this.socket.connect(this.session!, true);
        return this.socket;
    }
}