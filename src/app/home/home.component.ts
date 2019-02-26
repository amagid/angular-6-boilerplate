import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { PanelService } from '@services/panel/panel.service';
import { ModalService } from '@services/modal/modal.service';
import { HttpErrorService } from '@services/http-error/http-error.service';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { Panel } from '@datatypes';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  notifyOnDestroy: Subject<null> = new Subject<null>();
  panels: Observable<Array<Panel>>;
  panelList: any[] = [];

  constructor(private router: Router, private panelService: PanelService, private modalService: ModalService, private httpErrorService: HttpErrorService, private authService: AuthenticationService) { }

  ngOnInit() {
    this.panels = this.panelService.myPanels.get();
    this.panelService.myPanels.subscribe(this.notifyOnDestroy, this.displayPanels, this.retrievalError);
  }

  ngOnDestroy() {
    this.notifyOnDestroy.next();
    this.notifyOnDestroy.complete();
  }

  displayPanels = (panels: any[]) => {
    this.panelList = panels;
  }

  retrievalError = (error: any) => {
    this.authService.logout();
    this.httpErrorService.standard(error, '/login');
  }

}
