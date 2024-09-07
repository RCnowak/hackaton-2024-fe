import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../modules/auth/services/token.service';

export const interceptToken: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const tokenService = inject(TokenService);
    const authReq = req.clone({
        headers: req.headers.append('Authorization', 'Bearer ' + tokenService.token)
    });

    return next(authReq);
}
