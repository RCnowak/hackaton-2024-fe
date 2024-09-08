import { Component, HostListener, inject } from '@angular/core';
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
    username: string = '';
    password: string = '';

    error: string = '';
    @HostListener('document:keydown.enter')
    login() {
        this.auth.login(this.username + '@mail.ru', this.password)
            .then(() => {
                this.router.navigateByUrl('/main');
                this.error = '';
            }).catch(response=>{
              if(response.status === 400 || response.status === 401) {
                this.error = 'неверный логин / пароль';
              }
            if(this.password.length < 8 && this.username) {
              this.error = 'пароль должен быть не меньше 8 символов';
            }
        });
    }
}
