import { inject } from '@angular/core'
import { RedirectCommand, Router } from '@angular/router';
import { NAKAMA } from '@api/nakama';
import { SessionService } from '@auth/services/session.service'

export const userResolver = () => {
    const session = inject(SessionService);
    const router = inject(Router)
    const nakama = inject(NAKAMA);

    return nakama.getAccount(session.session!)
        .catch(() => {
            session.clearToken();
            return new RedirectCommand(router.parseUrl('/login'));
        });
}