import { inject, Injectable } from '@angular/core';
import { NAKAMA } from '@api/nakama';
import { SessionService } from '@auth/services/session.service';
import { PlayerStatus } from '@game/models/types';
import { Match, MatchData, Socket } from '@heroiclabs/nakama-js';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private nakama = inject(NAKAMA);
    private session = inject(SessionService).session;
    socket!: Socket | null;
    match: Match | null = null;

    async create() {
        this.socket = this.nakama.createSocket();
        await this.socket.connect(this.session!, true);
        return this.socket;
    }

    requestStatus(match_id: string) {
        return this.socket!.sendMatchState(match_id, OpCode.ReadyStatusRequest, '');
    }

    subscribeOn(code: OpCode) {
        return new Observable(observer => {
            this.socket!.onmatchdata = (matchdata: MatchData) => {
                if (matchdata.match_id === this.match!.match_id && matchdata.op_code === code) {
                    const decoder = new TextDecoder();
                    const str = decoder.decode(matchdata.data);
                    console.log(str);
                    observer.next({
                        ...matchdata,
                        data: JSON.parse(str)
                    });
                }
            };
        });
    }

    async createMatch(username: string) {
        this.match = await this.create()
            .then(socket => socket.createMatch(username))
    }

    async joinMatch(match_id: string) {
        this.match = await this.socket!.joinMatch(match_id);
        await this.requestStatus(match_id);
    }

    async leaveMatch() {
        await this.socket?.leaveMatch(this.match!.match_id)
    }

    async changeReadyStatus(status: PlayerStatus) {
        this.socket?.sendMatchState(this.match!.match_id, OpCode.ReadyStatusChange, status);
    }

    async sendMatchData(code: OpCode, data: object) {
        this.socket?.sendMatchState(this.match!.match_id, code, JSON.stringify(data));
    }
}

export enum OpCode {
    ReadyStatusRequest = 0,
    ReadyStatus = 1,
    ReadyStatusChange = 2
}