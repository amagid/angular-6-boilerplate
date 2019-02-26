import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { of, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ModalService } from '@services/modal/modal.service';
import { environment } from '@env/environment';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private router: Router, private modalService: ModalService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // TODO: Improve this authExemptRoutes and authExemptPages functionality & exctract to its own module
        const authExemptRoutes = [
            'auth/complete-signup',
            'auth/verify-token',
            'api/users/by-token'
        ];
        const authExemptPages = [
            'complete-signup',
            'login'
        ]
        let authRequired = true;
        for (let path of authExemptRoutes) {
            if (req.url.includes(path)) {
                authRequired = false;
            }
        }
        if (req.url.substr(environment.serverUrl.length) === '/auth') {
            authRequired = false;
        }
        // TODO: Resolve issue with token retrieval causing circular dependency with Auth Service. (Create token retrieval service?)
        const token = localStorage.getItem('token');
        const newReq = req.clone({url: req.url, headers: authRequired ? req.headers.set("authorization", `Bearer ${token ? JSON.parse(token) : ''}`) : req.headers.delete('authorization')});
        return next.handle(newReq)
        .pipe(catchError((response: any) => {
            let authRequired = true;
            for (let path of authExemptPages) {
                if (window.location.pathname.includes(path)) {
                    authRequired = false;
                }
            }
            if (authRequired && response && response.status === 401) {
                this.modalService.deactivateModals();
                this.router.navigate(['/login']);
            } else if (authRequired && response && response.status === 403) {
                this.modalService.deactivateModals();
                this.router.navigate(['/dashboard']);
            } else if (response && response.status >= 400) {
                return throwError({ error: response.error, status: response.status });
            }
            return of(response);
        }));
    }
}