import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NAKAMA } from '@api/nakama';
import { SessionService } from '@auth/services/session.service';
import {SocketService} from "@game/services/socket.service";
import { Match } from '@heroiclabs/nakama-js';

@Component({
    templateUrl: './matches.component.html',
    styleUrl: './matches.component.scss'
})
export default class MatchesPageComponent {
    private nakama = inject(NAKAMA);
    public matches: Match[] = [];
    private session = inject(SessionService);
    private socket = inject(SocketService);
    private router = inject(Router);

    async getMatches(){
      return this.nakama.listMatches(this.session.session!);
    }

    async ngOnInit() {
        await this.socket.create()
        this.matches = (await this.getMatches()).matches as Match[];
    }

    join(match_id: string) {
        this.router.navigateByUrl('/lobby?match_id=' + match_id);
    }

}
