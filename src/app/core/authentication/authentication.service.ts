import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, BehaviorSubject, Subject, Subscription } from 'rxjs';
import { map, catchError, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { JWTValidityResponse } from '@datatypes';

export interface TokenResponse {
  token: string;
}

export interface Credentials {
  username: string;
  password: string;
}

const tokenKey = 'token';
const roleKey = 'role';

/**
 * Provides a base for authentication workflow.
 * The Token interface as well as login/logout methods should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements OnDestroy {

  private _token: string | null;
  private _role: string | null;
  private _loginObservable: BehaviorSubject<boolean|null> = new BehaviorSubject(null);

  constructor(private httpClient: HttpClient) {
    const savedToken = localStorage.getItem(tokenKey);
    if (savedToken) {
      this._token = JSON.parse(savedToken);
      this._role = this._extractRole(this._token);
    }
    
    this.isAuthenticated(true)
      .subscribe((loggedIn: boolean) => {
        this._loginObservable.next(loggedIn);
      });
  }

  ngOnDestroy() {
    this._loginObservable.complete();
  }

  /**
   * Authenticates the user.
   * @param {Credentials} credentials The login parameters.
   * @return {Observable<Token>} The user token.
   */
  login(credentials: Credentials): Observable<any> {
    return this.httpClient
      .post(`/auth`, credentials)
      .pipe(map((response: TokenResponse) => {
        this.setToken(response.token);
        if (response.token) {
          this._loginObservable.next(true);
        }
        return response.token;
      }));
  }

  /**
   * Subscribe to updates about the user's logged in status. Subscribers will
   * receive NULL on application start, then TRUE or FALSE depending on
   * whether or not the user is currently logged in, and then TRUE every time
   * the user logs in and FALSE every time the user logs out.
   * @param unsubscribe A Subject which should complete when the subscriber's component is destroyed.
   * @param subscriber A function to run when the user logs in or out.
   */
  onLogin(unsubscribe: Subject<null>, subscriber: (loggedIn: boolean|null)=>void): Subscription {
    return this._loginObservable.pipe(takeUntil(unsubscribe)).subscribe({ next: subscriber});
  }

  /**
   * Logs out the user and clear token.
   * @return {Observable<boolean>} True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    // Customize token invalidation here
    this.setToken();
    this._loginObservable.next(false);
    return of(true);
  }

  /**
   * Checks is the user is authenticated.
   * @param {boolean} checkWithServer If true, validate JWT by sending it to the server.
   * @return {boolean} True if the user is authenticated.
   */
  isAuthenticated(checkWithServer: boolean = false): Observable<boolean> {
    if (checkWithServer) {
      return this.httpClient
        .post('/auth/verify-jwt', {})
        .pipe(catchError((err: any) => {
          return of({ valid: false });
        }))
        .pipe(map((response: JWTValidityResponse) => {
          return !!response.valid;
        }));
    }
    return of(!!this.token);
  }

  isUserPermissionSufficient(minPermissions: string | null): boolean {
    if (!minPermissions || minPermissions === 'any') {
      return true;
    } else if (minPermissions === 'viewer') {
      return this.role === 'viewer' || this.role === 'operator' || this.role === 'company' || this.role === 'admin';
    } else if (minPermissions === 'operator') {
      return this.role === 'operator' || this.role === 'company' || this.role === 'admin';
    } else if (minPermissions === 'company') {
      return this.role === 'company' || this.role === 'admin';
    } else if (minPermissions === 'factory') {
      return this.role === 'factory' || this.role === 'admin';
    } else if (minPermissions === 'admin') {
      return this.role === 'admin';
    } else {
      return false;
    }
  }

  userIsFactory(): boolean {
    return this.role === 'factory';
  }

  userIsAdmin(): boolean {
    return this.role === 'admin';
  }

  /**
   * Gets the user token.
   * @return {Token} The user token or null if the user is not authenticated.
   */
  get token(): string | null {
    return this._token;
  }

  /**
   * Gets the user role.
   * @return {Role} The user role or null if the user is not authenticated.
   */
  get role(): string | null {
    return this._role;
  }

  /**
   * Extracts the user's permission level from their JWT for easy access.
   * @param {string} token The user token or null if the user is not authenticated.
   * @return {Role} The user role or null if the user is not authenticated.
   */
  _extractRole(token?: string): string {
    return this._role = (!!token && JSON.parse(atob(token.split('.')[1])).role) || '';
  }

  /**
   * Sets the user token.
   * @param {Token=} token The user token.
   */
  private setToken(token?: string) {
    this._token = token || null;
    this._role = this._extractRole(this._token);

    if (token) {
      localStorage.setItem(tokenKey, JSON.stringify(token));
      localStorage.setItem(roleKey, this._role);
    } else {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(roleKey);
    }
  }

}
