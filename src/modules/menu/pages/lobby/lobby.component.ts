import { Component, inject } from '@angular/core';
import { NAKAMA } from '@api/nakama';

@Component({
    templateUrl: './lobby.component.html',
    styleUrl: './lobby.component.scss'
})
export default class LobbyPageComponent {
    private nakama = inject(NAKAMA);

    ngOnInit() {
        this.nakama.createSocket()
    }
}