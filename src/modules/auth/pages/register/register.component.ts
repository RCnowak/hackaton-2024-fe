import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    imports: [
        RouterModule,
        FormsModule
    ],
    standalone: true
})
export default class RegisterPageComponent {
    private auth = inject(AuthService);
    private router = inject(Router);

    username: string = '';
    password: string = '';

    register() {
        this.auth.register(this.username, this.password)
            .then(() => {
                this.router.navigateByUrl('/main');
            });
    }
}