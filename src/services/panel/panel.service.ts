import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs';
import { map, catchError, publishReplay, refCount, takeUntil, first } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Panel, PanelDetails, PanelReport } from '@datatypes';
import { ModalService } from '@services/modal/modal.service';
import { AuthenticationService } from '@app/core';

@Injectable()
export class PanelService implements OnDestroy {

  notifyOnDestroy: Subject<null> = new Subject<null>();

  constructor(private httpClient: HttpClient, private modalService: ModalService, private authService: AuthenticationService) {

    this.authService.onLogin(this.notifyOnDestroy, (loggedIn: boolean|null) => {
      if (loggedIn === false) {
        this.myPanels._observable.next([]);
        this.allPanels._observable.next([]);
        this.panelDetails._observable.next({});
        this.panelReports._observable.next([]);
        this.byCompany._observable.next([]);
      }
    });
  }

  ngOnDestroy() {
    this.myPanels._observable.complete();
    this.myPanels._error.complete();
    this.allPanels._observable.complete();
    this.allPanels._error.complete();
    this.panelDetails._observable.complete();
    this.panelDetails._error.complete();
    this.panelReports._observable.complete();
    this.panelReports._error.complete();
    this.byCompany._observable.complete();
    this.byCompany._error.complete();
    this.notifyOnDestroy.next();
    this.notifyOnDestroy.complete();
  }

  checkUnfinished(panel: Panel | PanelDetails): Panel | PanelDetails {
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

  allPanels = {
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
      if (+(new Date) - this.allPanels._lastRun >= environment.httpRefreshTimeout) {
        this.allPanels._lastRun = +new Date;
        this.httpClient
          .get(`/api/panels?includeDeactivated=true`)
          .subscribe((result: any) => {
            if (Array.isArray(result[0])) {
              result = result[0];
            }
            result.forEach((panel: Panel) => {
              this.checkUnfinished(panel);
            });
            this.allPanels._observable.next(this.allPanels._sortResults(result));
          }, (error: any) => {
            this.allPanels._error.next(error);
          });
      }
      return this.allPanels._observable.asObservable();
    },
    subscribe: (unsubscribe: Subject<null>, onNext: (results: Panel[])=>void = ()=>{}, onError: (error: any)=>void = ()=>{}, onComplete: ()=>void = ()=>{}) => {
      this.allPanels._error.pipe(takeUntil(unsubscribe)).subscribe({ next: onError });
      return this.allPanels._observable.pipe(takeUntil(unsubscribe)).subscribe({ next: onNext, error: onError, complete: onComplete });
    }
  }

  panelDetails = {
    _observable: new BehaviorSubject(null),
    _error: new Subject(),
    _lastRun: 0,
    _getUpdatedModelInfo: (modelNum: string) => {
      return this.httpClient
        .get('/api/models/by-number/' + modelNum);
    },
    get: (panelId: number, includeLastReport: boolean = false, includePreferences: boolean = false, includeModelSpecs: boolean = false) => {
      //Block duplicate requests made within a specified timeout period
      if (+(new Date) - this.panelDetails._lastRun >= environment.httpRefreshTimeout) {
        this.panelDetails._lastRun = +new Date;
        this.httpClient
          .get(`/api/panels/${panelId}?includePreferences=${includePreferences}&includeLastReport=${includeLastReport}&includeModelSpecs=${includeModelSpecs}`)
          .subscribe((panelDetails: PanelDetails) => {
            this.checkUnfinished(panelDetails);
            this.panelDetails._observable.next(panelDetails);
          }, (error: any) => {
            this.panelDetails._error.next(error);
          });
      }
      return this.panelDetails._observable.asObservable();
    },
    update: (panelId: number, updates: any) => {
      let request = this.httpClient
        .patch('/api/panels/' + panelId, updates)
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        let details = this.panelDetails._observable.getValue();
        details.displayName = updates.displayName;
        details.description = updates.description;
        details.location = updates.location;
        this.checkUnfinished(details);
        this.panelDetails._observable.next(details);
        if (details && updates.model && (!details.model || details.model.model !== updates.model)) {
          this.panelDetails._getUpdatedModelInfo(updates.model)
            .subscribe((model: any) => {
              this.panelDetails._observable.next(Object.assign(this.panelDetails._observable.getValue(), { model }));
            }, (error: any) => {
              setTimeout(() => {
                this.modalService.failure({ message: 'Could Not Update Model Number - Model Number Not Found' }, { timeout: 4000 });
              }, 2000);
            });
        }
      });
      return request;
    },
    updateState: (panelId: number, state: boolean) => {
      let obs;
      if (state) {
        obs = this.httpClient.patch('/api/panels/' + panelId + '/restore', {})
          .pipe(publishReplay(1), refCount());

        obs.subscribe((result: any) => {
          this.panelDetails._observable.next(Object.assign(this.panelDetails._observable.getValue(), { deletedAt: null }));
        }, (error: any) => {
          if (error && error.status === 404) {
            this.modalService.failure({ message: 'Panel Already Reactivated' });
            this.panelDetails._observable.next(Object.assign(this.panelDetails._observable.getValue(), { deletedAt: null }));
          } else {
            let replaceData = this.panelDetails._observable.getValue();
            this.modalService.unknownError({ replaceData });
            this.panelDetails._observable.next(replaceData);
          }
        });
      } else {
        obs = this.httpClient.delete('/api/panels/' + panelId)
          .pipe(publishReplay(1), refCount());
        obs.subscribe((result: any) => {
          this.panelDetails._observable.next(Object.assign(this.panelDetails._observable.getValue(), { deletedAt: (new Date).toISOString() }));
        }, (error: any) => {
          if (error && error.status === 404) {
            this.modalService.failure({ message: 'Panel Already Deactivated' });
            this.panelDetails._observable.next(Object.assign(this.panelDetails._observable.getValue(), { deletedAt: (new Date).toISOString() }));
          } else {
            let replaceData = this.panelDetails._observable.getValue();
            this.modalService.unknownError({ replaceData });
            this.panelDetails._observable.next(replaceData);
          }
        });
      }
      return obs;
    },
    forceDelete: (panelId: number) => {
      let obs = new Subject();
      this.httpClient.delete('/api/panels/' + panelId + '/force')
        .pipe(publishReplay(1), refCount())
        .subscribe((result: any) => {
          this.modalService.success("Panel Fully Deleted Successfully")
            .pipe(first()).subscribe(() => {
              obs.next();
              obs.complete();
            });
          this.panelDetails._observable.next({});
        }, (error: any) => {
          if (error && error.status === 404) {
            this.modalService.failure({ message: 'Panel Not Found' });
            this.panelDetails._observable.next(this.panelDetails._observable.getValue());
          } else {
            let replaceData = this.panelDetails._observable.getValue();
            this.modalService.unknownError({ replaceData });
            this.panelDetails._observable.next(replaceData);
          }
        });
      return obs.asObservable().pipe(publishReplay(1), refCount());
    },
    getQRCode: (panelId: number) => {
      let obs = new Subject();
      this.httpClient.get('/api/panels/' + panelId + '/qrcode-by-id')
        .pipe(publishReplay(1), refCount())
        .subscribe((result: any) => {
          obs.next(result.qrCode);
          obs.complete();
        }, (error: any) => {
          if (error && error.status === 404) {
            this.modalService.failure({ message: 'Panel Not Found' });
            this.panelDetails._observable.next(this.panelDetails._observable.getValue());
          } else {
            let replaceData = this.panelDetails._observable.getValue();
            this.modalService.unknownError({ replaceData });
            this.panelDetails._observable.next(replaceData);
          }
        });
      return obs.asObservable().pipe(publishReplay(1), refCount());
    },
    subscribe: (unsubscribe: Subject<null>, onNext: (results: PanelDetails)=>void = ()=>{}, onError: (error: any)=>void = ()=>{}, onComplete: ()=>void = ()=>{}) => {
      this.panelDetails._error.pipe(takeUntil(unsubscribe)).subscribe({ next: onError });
      return this.panelDetails._observable.pipe(takeUntil(unsubscribe)).subscribe({ next: onNext, error: onError, complete: onComplete });
    }
  }

  panelReports = {
    _observable: new BehaviorSubject(null),
    _error: new Subject(),
    _lastRun: 0,
    get: (panelId: number, includeReportTypes: boolean = false) => {
      //Block duplicate requests made within a specified timeout period
      if (+(new Date) - this.panelReports._lastRun >= environment.httpRefreshTimeout) {
        this.panelReports._lastRun = +new Date;
        this.httpClient
          .get('/api/panels/' + panelId + '/reports' + '?includeReportTypes=' + includeReportTypes)
          .subscribe((panelReports: PanelReport[]) => {
            this.panelReports._observable.next(panelReports);
          }, (error: any) => {
            this.panelReports._error.next(error);
          });
      }
      return this.panelReports._observable.asObservable();
    },
    subscribe: (unsubscribe: Subject<null>, onNext: (results: PanelReport[])=>void = ()=>{}, onError: (error: any)=>void = ()=>{}, onComplete: ()=>void = ()=>{}) => {
      this.panelReports._error.pipe(takeUntil(unsubscribe)).subscribe({ next: onError });
      return this.panelReports._observable.pipe(takeUntil(unsubscribe)).subscribe({ next: onNext, error: onError, complete: onComplete });
    }
  }

  panelRegistration = {
    register: () => {
        let obs = this.httpClient
          .post('/api/panels/register', {})
          .pipe(publishReplay(1), refCount());
        return obs;
    },
    claim: (id: string|number) => {
      let obs = this.httpClient.patch(`/api/panels/${id}/claim`, {})
        .pipe(publishReplay(1), refCount());
      obs.subscribe(() => {
        //Refresh company panels list
        this.byCompany.get('self');
      });
      return obs;
    }
  }

  byCompany = {
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
    get: (companyId: number|string = 'self') => {
      //Block duplicate requests made within a specified timeout period
      if (+(new Date) - this.byCompany._lastRun >= environment.httpRefreshTimeout) {
        this.byCompany._lastRun = +new Date;
        this.httpClient
          .get(`/api/companies/${companyId}/panels`)
          .subscribe((result: any) => {
            if (Array.isArray(result[0])) {
              result = result[0];
            }
            result.forEach((panel: Panel) => {
              this.checkUnfinished(panel);
            });
            this.byCompany._observable.next(this.byCompany._sortResults(result));
          }, (error: any) => {
            this.byCompany._error.next(error);
          });
      }
      return this.byCompany._observable.asObservable();
    },
    subscribe: (unsubscribe: Subject<null>, onNext: (results: Panel[])=>void = ()=>{}, onError: (error: any)=>void = ()=>{}, onComplete: ()=>void = ()=>{}) => {
      this.byCompany._error.pipe(takeUntil(unsubscribe)).subscribe({ next: onError });
      return this.byCompany._observable.pipe(takeUntil(unsubscribe)).subscribe({ next: onNext, error: onError, complete: onComplete });
    }
  }
}
