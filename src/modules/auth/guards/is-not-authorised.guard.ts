import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { GuardResult, Router } from '@angular/router';

export const isNotAuthorised = (): GuardResult => {
    const _isNotAuthorised = !inject(TokenService).isAuthorised();
    const router = inject(Router);

    return _isNotAuthorised || router.parseUrl('/settings');
};