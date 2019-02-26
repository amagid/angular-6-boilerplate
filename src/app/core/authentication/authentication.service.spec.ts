import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';

const tokenKey = 'token';

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    });
  });

  beforeEach(inject([
    AuthenticationService
  ], (_authenticationService: AuthenticationService) => {
    authenticationService = _authenticationService;
  }));

  afterEach(() => {
    // Cleanup
    localStorage.removeItem(tokenKey);
    sessionStorage.removeItem(tokenKey);
  });

  describe('login', () => {
    it('should return token', fakeAsync(() => {
      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      request.subscribe(token => {
        expect(token).toBeDefined();
        expect(token.token).toBeDefined();
      });
    }));

    it('should authenticate user', fakeAsync(() => {
      expect(authenticationService.isAuthenticated()).toBe(false);

      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      request.subscribe(() => {
        expect(authenticationService.isAuthenticated()).toBe(true);
        expect(authenticationService.token).toBeDefined();
        expect(authenticationService.token).not.toBeNull();
      });
    }));

    it('should persist token for the session', fakeAsync(() => {
      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      request.subscribe(() => {
        expect(sessionStorage.getItem(tokenKey)).not.toBeNull();
      });
    }));

    it('should persist token across sessions', fakeAsync(() => {
      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      request.subscribe(() => {
        expect(localStorage.getItem(tokenKey)).not.toBeNull();
      });
    }));
  });

  describe('logout', () => {
    it('should clear user authentication', fakeAsync(() => {
      // Arrange
      const loginRequest = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      loginRequest.subscribe(() => {
        expect(authenticationService.isAuthenticated()).toBe(true);

        const request = authenticationService.logout();
        tick();

        request.subscribe(() => {
          expect(authenticationService.isAuthenticated()).toBe(false);
          expect(authenticationService.token).toBeNull();
          expect(sessionStorage.getItem(tokenKey)).toBeNull();
          expect(localStorage.getItem(tokenKey)).toBeNull();
        });
      });
    }));

    it('should clear persisted user authentication', fakeAsync(() => {
      // Arrange
      const loginRequest = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      loginRequest.subscribe(() => {
        expect(authenticationService.isAuthenticated()).toBe(true);

        const request = authenticationService.logout();
        tick();

        request.subscribe(() => {
          expect(authenticationService.isAuthenticated()).toBe(false);
          expect(authenticationService.token).toBeNull();
          expect(sessionStorage.getItem(tokenKey)).toBeNull();
          expect(localStorage.getItem(tokenKey)).toBeNull();
        });
      });
    }));
  });
});
