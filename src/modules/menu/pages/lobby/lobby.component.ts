import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Player, PlayerStatus, PlayerStatusChange } from '@game/models/types';
import { OpCode, SocketService } from '@game/services/socket.service';
import { Match, MatchPresenceEvent, User } from '@heroiclabs/nakama-js';
import { merge } from 'rxjs';

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
    private statuses: PlayerStatusChange[] = [];

    async ngOnInit() {
        const match_id =  this.route.queryParams['match_id'];
        this.isHost = !match_id;

        if (this.isHost) {
            await this.createMatch();
            this.socket.subscribeOn(OpCode.ReadyStatusRequest)
                .subscribe(() => this.socket.sendMatchData(OpCode.ReadyStatus, this.players))
        } else {
            await this.joinMatch(match_id)
        }

        this.socket.socket!.onmatchpresence = matchpresence => {
            this.addPlayers(matchpresence.joins || []);
            matchpresence.leaves?.forEach(presence => {
                this.players.filter(player => player.id !== presence.user_id);
            });
        };

        merge(
            this.socket.subscribeOn(OpCode.ReadyStatus),
            this.socket.subscribeOn(OpCode.ReadyStatusChange),
        )
            .subscribe(console.log);
    }

    private async createMatch() {
        await this.socket.createMatch(this.user.username!);
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
        // this.socket.socket?.sendMatchState()
    }

    leave() {
        this.socket.leaveMatch()
            .then(() => this.router.navigateByUrl('/main'));
    }

    markAs(status: PlayerStatus) {
        this.socket.changeReadyStatus(status);
        this.currentStatus = status;
        this.players.find(s => s.id === this.user.id)!.status = status;
    }

    private updateStatuses() {
        this.statuses.forEach(status => {
            const player = this.players.find(p => p.id === status.user_id);
            const _status = status.status || 'notready';
            if (player) {
                player.status = _status;
            }
            if (status.user_id === this.user.id) {
                this.currentStatus = _status;
            }
        })
    }
}