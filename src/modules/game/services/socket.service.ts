import { inject, Injectable } from '@angular/core';
import { Match, MatchData, Socket, User } from '@heroiclabs/nakama-js';
import { BehaviorSubject, filter, Observable, Subject } from 'rxjs';

import { NAKAMA } from '@api/nakama';
import { SessionService } from '@auth/services/session.service';
import { IMessage } from '@game/utils';

export type PlayerStatus = 'ready' | 'notready';
export type Player = {
    username: string;
    id: string;
    status: PlayerStatus;
}

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private nakama = inject(NAKAMA);
    private session = inject(SessionService).session;
    socket!: Socket | null;
    match: Match | null = null;
    matchData$: Subject<MatchData> = new Subject();
    isHost: boolean = false;

    private message$$: BehaviorSubject<IMessage> = new BehaviorSubject<IMessage>({
        action: "init",
        payload: null
    });
    public message$: Observable<IMessage> = this.message$$.asObservable();

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
        this.isHost = true;
        this.match = await this.socket!.createMatch(username);
        this.listenMatchData()
        
        return this.match;
    }

    async joinMatch(match_id: string) {
        this.match = await this.socket!.joinMatch(match_id);
        await this.requestStatus(match_id);
        this.listenMatchData()
        
        return this.match;
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
            const data = str && JSON.parse(str);
            this.matchData$.next({
                ...matchdata,
                data: str && JSON.parse(str)
            });
            if (matchdata.op_code === OpCode.GameEvent) {
                this.message$$.next(data);
            }
        };
    }

    dispatchGameEvent(message: IMessage) {
        this.message$$.next(message);
        this.sendMatchData(OpCode.GameEvent, message);
    }
}

export enum OpCode {
    ReadyStatusRequest = 1,
    ReadyStatus = 2,
    ReadyStatusChange = 3,
    GameStart = 4,
    SceneReady = 5,
    GameEvent = 6,
    GamePause = 7,
    GameResume = 8,
    End = 9
}