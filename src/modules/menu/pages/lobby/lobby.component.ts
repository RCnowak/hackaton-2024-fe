import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OpCode, Player, PlayerStatus, SocketService } from '@game/services/socket.service';
import { MatchPresenceEvent, User } from '@heroiclabs/nakama-js';
import { merge, Subject, takeUntil } from 'rxjs';

@Component({
    templateUrl: './lobby.component.html',
    styleUrl: './lobby.component.scss'
})
export default class LobbyPageComponent {
    private router = inject(Router);
    private route = inject(ActivatedRoute).snapshot;
    private user: User = this.route.parent?.data['user'].user;
    private socket = inject(SocketService);
    users: string[] = [];
    players: Player[] = []

    isHost: boolean = this.route.queryParams['match_id'];
    currentStatus: PlayerStatus = 'notready';

    private unsubscribe = new Subject<void>();

    async ngOnInit() {
        const match_id =  this.route.queryParams['match_id'];
        this.isHost = !match_id;

        if (this.isHost) {
            await this.createMatch();
        } else {
            await this.joinMatch(match_id)
        }

        this.socket.socket!.onmatchpresence = matchpresence => {
            this.addPlayers(matchpresence.joins || []);
            matchpresence.leaves?.forEach(presence => {
                this.players = this.players.filter(player => player.id !== presence.user_id);
            });
        };

        merge(
            this.socket.subscribeOn(OpCode.ReadyStatus),
            this.socket.subscribeOn(OpCode.ReadyStatusChange),
        )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((matchData: any) => {
                console.log(matchData)
                const players = matchData.data as Player[];
                console.log(players)
                players.forEach(p => this.players.find(_p => p.id === _p.id)!.status = p.status);
            });
        this.socket.subscribeOn(OpCode.GameStart)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.router.navigateByUrl('/game'));
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    private async createMatch() {
        await this.socket.createMatch(this.user.username!);
        this.socket.subscribeOn(OpCode.ReadyStatusRequest)
            .pipe(takeUntil(this.unsubscribe))
                .subscribe(() => {
                    this.socket.sendMatchData(OpCode.ReadyStatus, this.players);
                })
    }

    private async joinMatch(match_id: string) {
        await this.socket.joinMatch(match_id);
        this.addPlayers(this.socket.match!.presences);
    }

    private addPlayers(matchpresence: MatchPresenceEvent['joins']) {
        matchpresence.forEach(presence => {
            this.players.push({
                username: presence.username,
                id: presence.user_id,
                status: 'notready'
            });
        });
    }

    start() {
        this.socket.sendMatchData(OpCode.GameStart, {});
        this.router.navigateByUrl('/game');
    }

    leave() {
        this.socket.leaveMatch()
            .then(() => this.router.navigateByUrl('/main'));
    }

    markAs(status: PlayerStatus) {
        this.socket.changeReadyStatus(status, this.user);
        this.currentStatus = status;
        this.players.find(s => s.id === this.user.id)!.status = status;
    }
}