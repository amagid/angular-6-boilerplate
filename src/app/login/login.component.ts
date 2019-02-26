import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, map, catchError } from 'rxjs/operators';

import { environment } from '@env/environment';
import { Logger, I18nService, AuthenticationService } from '@app/core';
import { LoginValidators } from '@validators';

const log = new Logger('Login');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  version: string = environment.version;
  error: string;
  isLoading = false;
  loaded = false;
  validators = LoginValidators;
  overrideMessages = {
    username: '',
    password: ''
  };

  constructor(private router: Router,
              private i18nService: I18nService,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.loaded = true;
    }, 100);
    return this.authenticationService.isAuthenticated(true)
      .subscribe((authenticated: boolean) => {
        if (authenticated) {
          this.navigateHome();
        } else {
          this.authenticationService.logout();
        }
      });
  }

  login(username: {error: boolean, value: string}, password: {error: boolean, value: string}) {
    if (username.error || password.error) {
      return;
    }
    this.overrideMessages.password = "";
    this.isLoading = true;
    let obs = this.authenticationService.login({ username: username.value, password: password.value })
      .subscribe(token => {
        log.debug(`Successfully logged in`);
        this.navigateHome();
      }, error => {
        log.debug(`Login error: ${error}`);
        this.overrideMessages.password = "Username / Password Combination Not Found";
      });
  }

  setLanguage(language: string) {
    this.i18nService.language = language;
  }

  get currentLanguage(): string {
    return this.i18nService.language;
  }

  get languages(): string[] {
    return this.i18nService.supportedLanguages;
  }

  navigateHome() {
    if (this.authenticationService.isUserPermissionSufficient('factory') && !this.authenticationService.isUserPermissionSufficient('admin')) {
      this.router.navigate(['/panel-registration']);
    } else if (this.authenticationService.isUserPermissionSufficient('admin')) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }

}
