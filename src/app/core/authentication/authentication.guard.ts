import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Logger } from '../logger.service';
import { AuthenticationService } from './authentication.service';

const log = new Logger('AuthenticationGuard');

@Injectable()
export class AuthenticationGuard implements CanActivate {

  constructor(private router: Router,
              private authenticationService: AuthenticationService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const minPermissions = route && route.data && route.data.minPermissions;
    return this._isAuthenticated()
      .pipe(map((authenticated: boolean) => {



        //===== DISABLING AUTH FOR BOILERPLATE ====//
        console.error("===== AUTH DISABLED IN src/app/core/authentication/authentication.guard.ts LINE 25-30!!! =====");
        const tru = true;
        if (tru) {
          return true;
        }



        if (authenticated && this.authenticationService.isUserPermissionSufficient(minPermissions)) {
          return true;
        }
        else if (!authenticated) {
          log.debug('Not authenticated, redirecting...');
          this.router.navigate(['/login']);
          return false;
        } else {
          log.debug('Insufficient permissions, redirecting...');
          this.router.navigate(['/login']);
          return false;
        }
      }));
  }

  _isAuthenticated(): Observable<boolean> {
    return this.authenticationService.isAuthenticated()
      .pipe(map((authenticated: boolean) => {



        //===== DISABLING AUTH FOR BOILERPLATE ====//
        console.error("===== AUTH DISABLED IN src/app/core/authentication/authentication.guard.ts LINE 55-60!!! =====");
        const tru = true;
        if (tru) {
          return true;
        }



        if (!authenticated) {
          log.debug('Not authenticated, redirecting...');
          this.router.navigate(['/login']);
          return false;
        } else {
          return true;
        }
      }));
  }
}