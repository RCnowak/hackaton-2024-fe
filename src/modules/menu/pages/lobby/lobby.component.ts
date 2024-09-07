import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '@game/services/socket.service';
import { Match, User } from '@heroiclabs/nakama-js';

type PlayerStatus = 'ready' | 'notready';
type Player = {
    username: string;
    id: string;
    status: PlayerStatus;
}
type PlayerStatusChange = {
    user_id: string;
    status: PlayerStatus;
}

@Component({
    templateUrl: './lobby.component.html',
    styleUrl: './lobby.component.scss'
})
export default class LobbyPageComponent {
    private router = inject(Router);
    private user: User = inject(ActivatedRoute).snapshot.parent?.data['user'].user;
    private socket = inject(SocketService);
    private match: Match | null = null;
    users: string[] = [];
    players: Player[] = []

    isHost: boolean = true;
    currentStatus: PlayerStatus = 'notready';
    private statuses: PlayerStatusChange[] = [];

    ngOnInit() {
        this.createMatch();

        this.socket.socket!.onmatchpresence = matchpresence => {
            matchpresence.joins.forEach(presence => {
                this.players.push({
                    username: presence.username,
                    id: presence.user_id,
                    status: 'notready'
                })
            });
            matchpresence.leaves?.forEach(presence => {
                this.players.filter(player => player.id !== presence.user_id);
            });
            this.updateStatuses();
            console.log(matchpresence)
        };

        this.socket.socket!.onstatuspresence = statuspresence => {
            this.statuses = statuspresence.joins as any as PlayerStatusChange[];
            this.updateStatuses();
            console.log(this.statuses)
        };
    }

    async createMatch() {
        this.match = await this.socket.create()
            .then(socket => socket.createMatch(this.user.username!));
    }

    start() {
        // this.socket.socket?.sendMatchState()
    }

    leave() {
        this.socket.socket?.leaveMatch(this.match!.match_id)
            .then(() => this.router.navigateByUrl('/main'));
    }

    ready() {
        this.changeStatus('ready');
    }
    notready() {
        this.changeStatus('notready');
    }

    private changeStatus(status: PlayerStatus) {
        this.socket.socket?.updateStatus(status);
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