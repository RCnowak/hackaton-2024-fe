import { inject, Injectable } from '@angular/core';
import { NAKAMA } from '@api/nakama';
import { SessionService } from '@auth/services/session.service';
import { Player, PlayerStatus } from '@game/models/types';
import { Match, MatchData, Socket, User } from '@heroiclabs/nakama-js';
import { filter, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private nakama = inject(NAKAMA);
    private session = inject(SessionService).session;
    socket!: Socket | null;
    match: Match | null = null;
    matchData$: Subject<MatchData> = new Subject();

    async create() {
        this.socket = this.nakama.createSocket();
        await this.socket.connect(this.session!, true);
        return this.socket;
    }

    requestStatus(match_id: string) {
        return this.socket!.sendMatchState(match_id, OpCode.ReadyStatusRequest, '');
    }

    subscribeOn(code: OpCode) {
        return this.matchData$
            .pipe(
                filter(matchdata => matchdata.match_id === this.match!.match_id && matchdata.op_code === code)
            );
    }

    async createMatch(username: string) {
        this.match = await this.create()
            .then(socket => socket.createMatch(username));
        this.listenMatchData();
    }

    async joinMatch(match_id: string) {
        this.match = await this.socket!.joinMatch(match_id);
        await this.requestStatus(match_id);
        this.listenMatchData();
    }

    async leaveMatch() {
        await this.socket?.leaveMatch(this.match!.match_id)
    }

    async changeReadyStatus(status: PlayerStatus, user: User) {
        this.socket?.sendMatchState(this.match!.match_id, OpCode.ReadyStatusChange, JSON.stringify([{
            id: user.id as string,
            username: user.username as string,
            status
        } satisfies Player]));
    }

    async sendMatchData(code: OpCode, data: object) {
        this.socket?.sendMatchState(this.match!.match_id, code, JSON.stringify(data));
    }

    private listenMatchData() {
        this.socket!.onmatchdata = (matchdata: MatchData) => {
            const decoder = new TextDecoder();
            const str = decoder.decode(matchdata.data);
            console.log(str);
            this.matchData$.next({
                ...matchdata,
                data: str && JSON.parse(str)
            });
        };
    }
}

export enum OpCode {
    ReadyStatusRequest = 1,
    ReadyStatus = 2,
    ReadyStatusChange = 3
}