import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';

import { NAKAMA } from '@api/nakama';
import { TokenObj, SessionService } from './session.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private session = inject(SessionService);
    private nakama = inject(NAKAMA);

    login(email: string, password: string) {
        return this.nakama.authenticateEmail(email, password)
            .then(res => this.session.setToken(res));
    }

    register(email: string, password: string) {
        return this.nakama.authenticateEmail(email, password, true)
            .then(res => this.session.setToken(res));
    }

    logout() {
        return this.nakama.sessionLogout(this.session.session!, this.session.session!.token, this.session.session!.refresh_token)
            .then(res => this.session.clearToken());
    }
}