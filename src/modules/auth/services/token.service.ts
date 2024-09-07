import { Injectable } from '@angular/core';

const TOKEN_LOCALSTORAGE_KEY = 'APP_TOKEN_KEY';

export type TokenObj = {token: string, refresh_token: string};

@Injectable({providedIn: 'root'})
export class TokenService {
    token: string | null = null;
    refresh_token: string | null = null;

    constructor() {
        const tokenObj: TokenObj = JSON.parse(localStorage.getItem(TOKEN_LOCALSTORAGE_KEY) || '{}');
        this.token = tokenObj.token || null;
        this.refresh_token = tokenObj.refresh_token || null;
    }

    setToken(tokenObj: TokenObj) {
        this.token = tokenObj.token;
        this.refresh_token = tokenObj.refresh_token;
        localStorage.setItem(TOKEN_LOCALSTORAGE_KEY, JSON.stringify(tokenObj));
    }

    clearToken() {
        this.token = null;
        this.refresh_token = null;
        localStorage.removeItem(TOKEN_LOCALSTORAGE_KEY)
    }

    isAuthorised() {
        return !!this.token;
    }
}