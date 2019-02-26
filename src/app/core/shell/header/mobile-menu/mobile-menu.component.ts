import { Component, OnInit, Input, Output, HostBinding, EventEmitter } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { MenuItem } from '@datatypes';

@Component({
  selector: 'mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss']
})
export class MobileMenuComponent implements OnInit {

  @Input() menuItems: MenuItem[];
  @Input() @HostBinding('class.active') menuActive: boolean;
  @Output() menuActiveChange = new EventEmitter();
  @Input() @HostBinding('class.mobile_only') mobileOnly: boolean = true;
  route: string;

  constructor(private router: Router) { }

  ngOnInit() {
    this.route = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.route = event.url;
      }
    });
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
    this.menuActiveChange.emit(this.menuActive);
  }

}
