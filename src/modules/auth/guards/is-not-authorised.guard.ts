import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { GuardResult, Router } from '@angular/router';

export const isNotAuthorised = (): GuardResult => {
    const _isNotAuthorised = !inject(SessionService).isAuthorised();
    const router = inject(Router);

    return _isNotAuthorised || router.parseUrl('/settings');
};