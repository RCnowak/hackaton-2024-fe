import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NAKAMA } from '@api/nakama';
import { SocketService } from '@game/services/socket.service';
import { User } from '@heroiclabs/nakama-js';

@Component({
    templateUrl: './lobby.component.html',
    styleUrl: './lobby.component.scss'
})
export default class LobbyPageComponent {
    private user: User = inject(ActivatedRoute).snapshot.parent?.data['user'];
    private socket = inject(SocketService);

    ngOnInit() {
        this.socket.create()
            .then(socket => socket.createMatch(this.user.username!))
            .then(console.log);
    }
}