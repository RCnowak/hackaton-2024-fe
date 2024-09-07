import { Injectable } from '@angular/core';
import { Session } from '@heroiclabs/nakama-js';

const TOKEN_LOCALSTORAGE_KEY = 'APP_TOKEN_KEY';

export type TokenObj = {token: string, refresh_token: string, created: boolean};

@Injectable({providedIn: 'root'})
export class SessionService {
    session: Session | null = null;

    constructor() {
        const tokenObj: TokenObj = JSON.parse(localStorage.getItem(TOKEN_LOCALSTORAGE_KEY) || '{}');
        if (tokenObj.token) {
            this.createSession(tokenObj);
        }
    }

    setToken(session: Session) {
        localStorage.setItem(TOKEN_LOCALSTORAGE_KEY, JSON.stringify({
            token: session.token,
            refresh_token: session.refresh_token,
            created: session.created,
        }));
        this.session = session;
    }

    clearToken() {
        localStorage.removeItem(TOKEN_LOCALSTORAGE_KEY);
        this.session = null;
    }

    isAuthorised() {
        return !!this.session;
    }

    createSession(tokenObj: TokenObj) {
        this.session = new Session(tokenObj.token, tokenObj.refresh_token, tokenObj.created);
    }
}