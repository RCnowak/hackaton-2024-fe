import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { GuardResult, Router } from '@angular/router';

export const isAuthorised = (): GuardResult => {
    const _isAuthorised = inject(TokenService).isAuthorised();
    const router = inject(Router);

    return _isAuthorised || router.parseUrl('/login');
};