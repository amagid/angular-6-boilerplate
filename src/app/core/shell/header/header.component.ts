import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../authentication/authentication.service';
import { I18nService } from '../../i18n.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  menuActive = false;

  menuItems = [{
    nav: () => { return this.goToDashboard(); },
    restrict: () => { return this.userIsNotFactoryOrAdmin(); },
    label: "Dashboard",
    route: '/dashboard'
  }, {
    nav: () => { return this.logout(); },
    label: "Log Out"
  }];

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private i18nService: I18nService) { }

  ngOnInit() { }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  closeMenu() {
    this.menuActive = false;
  }

  openMenu() {
    this.menuActive = true;
  }

  setLanguage(language: string) {
    this.i18nService.language = language;
  }

  userIsAdmin() {
    return this.authenticationService.isUserPermissionSufficient('admin');
  }

  userIsCompany() {
    return this.authenticationService.isUserPermissionSufficient('company') && !this.authenticationService.isUserPermissionSufficient('admin');
  }

  userIsNotFactoryOrAdmin() {
    return this.authenticationService.isUserPermissionSufficient('viewer') && !this.authenticationService.isUserPermissionSufficient('admin');
  }

  userIsNotFactory() {
    return this.authenticationService.isUserPermissionSufficient('viewer');
  }

  goToAdminConsole() {
    this.closeMenu();
    this.router.navigate(['/admin']);
  }

  goToDashboard() {
    this.closeMenu();
    this.router.navigate(['/dashboard']);
  }

  goToCompanyInfo() {
    this.closeMenu();
    this.router.navigate(['/company-info']);
  }

  goToSettings() {
    this.closeMenu();
    this.router.navigate(['/user-settings']);
  }

  logout() {
    this.authenticationService.logout()
      .subscribe(() => {
        this.closeMenu();
        this.router.navigate(['/login'])
      });
  }

  get currentLanguage(): string {
    return this.i18nService.language;
  }

  get languages(): string[] {
    return this.i18nService.supportedLanguages;
  }

}
