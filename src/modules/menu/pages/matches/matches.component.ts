import { Component, inject } from '@angular/core';
import { NAKAMA } from '@api/nakama';
import { SessionService } from '@auth/services/session.service';

@Component({
    templateUrl: './matches.component.html',
    styleUrl: './matches.component.scss'
})
export default class MatchesPageComponent {
    private nakama = inject(NAKAMA);
    private session = inject(SessionService);

    ngOnInit() {
        this.nakama.listMatches(this.session.session!)
    }
}