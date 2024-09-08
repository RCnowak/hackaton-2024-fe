import { InjectionToken } from '@angular/core';
import { Client } from '@heroiclabs/nakama-js';

export const NAKAMA = new InjectionToken('Nakama', {
    providedIn: 'root',
    factory: () => new Client('defaultkey', location.hostname, location.hostname === 'localhost' ? location.port : '7350')
})