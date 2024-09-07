import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [
        RouterModule,
        FormsModule
    ],
    standalone: true
})
export default class LoginPageComponent {
    private auth = inject(AuthService);
    private router = inject(Router);
    email: string = '';
    password: string = '';

    login() {
        this.auth.login(this.email, this.password)
            .then(() => {
                this.router.navigateByUrl('/main');
            });
    }
}