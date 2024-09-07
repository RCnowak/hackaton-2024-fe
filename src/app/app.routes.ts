import { Routes } from '@angular/router';
import LoginPageComponent from '../modules/auth/pages/login/login.component';
import SettingsPageComponent from '../modules/menu/pages/settings/settings.component';
import RegisterPageComponent from '../modules/auth/pages/register/register.component';
import { isAuthorised } from '../modules/auth/guards/is-authorized.guard';
import { isNotAuthorised } from '../modules/auth/guards/is-not-authorised.guard';
import InAppShellComponent from './shells/in-app-shell/in-app-shell.component';
import MenuPageComponent from '../modules/menu/pages/main/main.component';

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
        path: '',
        component: InAppShellComponent,
        canActivateChild: [
            isAuthorised
        ],
        children: [
            {
                path: 'main',
                component: MenuPageComponent
            },
            {
                path: 'settings',
                component: SettingsPageComponent
            },
        ]
    },
    {
        path: '**',
        redirectTo: '/main'
    }
];
