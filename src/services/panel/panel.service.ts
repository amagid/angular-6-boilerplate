import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs';
import { map, catchError, publishReplay, refCount, takeUntil, first } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Panel } from '@datatypes';
import { ModalService } from '@services/modal/modal.service';
import { AuthenticationService } from '@app/core';

@Injectable()
export class PanelService implements OnDestroy {

  notifyOnDestroy: Subject<null> = new Subject<null>();

  constructor(private httpClient: HttpClient, private modalService: ModalService, private authService: AuthenticationService) {

    this.authService.onLogin(this.notifyOnDestroy, (loggedIn: boolean|null) => {
      if (loggedIn === false) {
        this.myPanels._observable.next([]);
      }
    });
  }

  ngOnDestroy() {
    this.myPanels._observable.complete();
    this.myPanels._error.complete();
    this.notifyOnDestroy.next();
    this.notifyOnDestroy.complete();
  }

  checkUnfinished(panel: Panel): Panel {
    if (!panel.displayName) {
      panel.unfinished = true;
    } else {
      panel.unfinished = false
    }
    return panel;
  }

  myPanels = {
    _observable: new BehaviorSubject([]),
    _error: new Subject(),
    _lastRun: 0,
    _sortResults: (panels: Panel[]) => {
      const sorted: {
        error: Panel[],
        unfinished: Panel[],
        normal: Panel[],
        deactivated: Panel[]
      } = {
        error: [],
        unfinished: [],
        normal: [],
        deactivated: []
      };
  
      panels.forEach((panel: Panel) => {
        if (panel.deletedAt) {
          sorted.deactivated.push(panel);
        } else if (panel.errorState) {
          sorted.error.push(panel);
        } else if (!panel.displayName) {
          sorted.unfinished.push(panel);
        } else {
          sorted.normal.push(panel);
        }
      });
  
      return sorted.error.concat(sorted.unfinished).concat(sorted.normal).concat(sorted.deactivated);
    },
    get: () => {
      //Block duplicate requests made within a specified timeout period
      if (+(new Date) - this.myPanels._lastRun >= environment.httpRefreshTimeout) {
        this.myPanels._lastRun = +new Date;


        //===== USING BACKEND PLACEHOLDER IN panel.service.ts LINE 92 =====
        console.error("===== USING BACKEND PLACEHOLDER IN panel.service.ts LINE 92 =====");


        this.httpClient
          .get(`https://reqres.in/api/users`)
          .subscribe((result: any) => {
            result.data.forEach((panel: Panel) => {
              this.checkUnfinished(panel);
            });
            this.myPanels._observable.next(this.myPanels._sortResults(result.data));
          }, (error: any) => {
            this.myPanels._error.next(error);
          });
      }
      return this.myPanels._observable.asObservable();
    },
    subscribe: (unsubscribe: Subject<null>, onNext: (results: Panel[])=>void = ()=>{}, onError: (error: any)=>void = ()=>{}, onComplete: ()=>void = ()=>{}) => {
      this.myPanels._error.pipe(takeUntil(unsubscribe)).subscribe({ next: onError });
      return this.myPanels._observable.pipe(takeUntil(unsubscribe)).subscribe({ next: onNext, error: onError, complete: onComplete });
    }
  }

}
