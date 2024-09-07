import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { GuardResult, Router } from '@angular/router';

export const isAuthorised = (): GuardResult => {
    const _isAuthorised = inject(SessionService).isAuthorised();
    const router = inject(Router);

    return _isAuthorised || router.parseUrl('/login');
};