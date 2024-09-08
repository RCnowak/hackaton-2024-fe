import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { Location } from '@angular/common';

@Component({
    templateUrl: './in-app-shell.component.html',
    styleUrl: './in-app-shell.component.scss',
    standalone: true,
    imports: [
        RouterModule
    ]
})
export default class InAppShellComponent {
    private auth = inject(AuthService);
    private location = inject(Location);
    protected router = inject(Router);

    logout() {
        this.auth.logout()
            .then(() => this.router.navigateByUrl('/login'));
    }

    back() {
        this.location.back();
    }
}