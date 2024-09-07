import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NAKAMA } from '@api/nakama';

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
    username: string = '';
    password: string = '';

    login() {
        this.auth.login(this.username, this.password)
            .then(() => {
                this.router.navigateByUrl('/main');
            });
    }
}