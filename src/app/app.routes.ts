import { Routes } from '@angular/router';

import InAppShellComponent from './shells/in-app-shell/in-app-shell.component';

import LoginPageComponent from '@auth/pages/login/login.component';
import SettingsPageComponent from '@menu/pages/settings/settings.component';
import RegisterPageComponent from '@auth/pages/register/register.component';
import { isAuthorised } from '@auth/guards/is-authorized.guard';
import { isNotAuthorised } from '@auth/guards/is-not-authorised.guard';

import MenuPageComponent from '@menu/pages/main/main.component';
import LobbyPageComponent from '@menu/pages/lobby/lobby.component';
import MatchesPageComponent from '@menu/pages/matches/matches.component';
import { userResolver } from '@menu/services/user.resolver';
import { GameComponent } from '@game/game.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/main'
    },
    {
        path: '',
        canActivateChild: [
            isNotAuthorised
        ],
        children: [
            {
                path: 'login',
                component: LoginPageComponent
            },
            {
                path: 'register',
                component: RegisterPageComponent
            },
        ]
    },
    {
        path: 'game',
        component: GameComponent
    },
    {
        path: '',
        component: InAppShellComponent,
        canActivateChild: [
            isAuthorised
        ],
        resolve: {
            user: userResolver
        },
        children: [
            {
                path: 'main',
                component: MenuPageComponent
            },
            {
                path: 'settings',
                component: SettingsPageComponent
            },
            {
                path: 'lobby',
                component: LobbyPageComponent
            },
            {
                path: 'matches',
                component: MatchesPageComponent
            },
        ]
    },
    {
        path: '**',
        redirectTo: '/game'
    }
];
