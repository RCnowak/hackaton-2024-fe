import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TokenObj, TokenService } from './token.service';
import { tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private token = inject(TokenService);

    login(email: string, password: string) {
        return this.http.post<TokenObj>('/v2/account/authenticate/email', {
            email,
            password
        }, {
            headers: {
                "Authorization": "Basic " + btoa('defaultkey' + ":" + '')
            }
        })
            .pipe(tap(res => this.token.setToken(res)));
    }

    register(email: string, password: string) {
        return this.http.post<TokenObj>('/v2/account/authenticate/email', {
            email,
            password
        }, {
            headers: {
                "Authorization": "Basic " + btoa('defaultkey' + ":" + '')
            }
        })
            .pipe(tap(res => this.token.setToken(res)));
    }

    logout() {
        return this.http.post('/v2/session/logout', {
            token: this.token.token,
            refreshToken: this.token.refresh_token
        })
            .pipe(tap(() => this.token.clearToken()));
    }
}