import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../modules/auth/services/auth.service';

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
    private router = inject(Router);

    logout() {
        this.auth.logout()
            .subscribe(() => this.router.navigateByUrl('/login'));
    }
}