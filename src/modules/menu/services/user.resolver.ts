import { inject } from '@angular/core'
import { NAKAMA } from '@api/nakama';
import { SessionService } from '@auth/services/session.service'

export const userResolver = () => {
    const session = inject(SessionService);
    const nakama = inject(NAKAMA);

    return nakama.getAccount(session.session!);
}