import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs';
import { map, catchError, publishReplay, refCount, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User } from '@datatypes';
import { ModalService } from '@services/modal/modal.service';
import { AuthenticationService } from '@app/core/authentication/authentication.service';

@Injectable()
export class UserService implements OnDestroy {

  notifyOnDestroy: Subject<null> = new Subject();

  constructor(private httpClient: HttpClient, private router: Router, private modalService: ModalService, private authService: AuthenticationService) {
    this.authService.onLogin(this.notifyOnDestroy, (loggedIn: boolean|null) => {
      if (loggedIn === true) {
        this.myUser.get();
      } else {
        this.oneUser._observable.next({});
        this.myUser._observable.next({});
        this.allUsers._observable.next([]);
        this.byCompany._observable.next([]);
        this.byToken._observable.next({});
      }
    });
  }

  ngOnDestroy() {
    this.oneUser._observable.complete();
    this.oneUser._error.complete();
    this.myUser._observable.complete();
    this.myUser._error.complete();
    this.allUsers._observable.complete();
    this.allUsers._error.complete();
    this.byCompany._observable.complete();
    this.byCompany._error.complete();
    this.byToken._observable.complete();
    this.byToken._error.complete();
    this.notifyOnDestroy.next();
    this.notifyOnDestroy.complete();
  }

  oneUser = {
    _observable: new BehaviorSubject<any>({}),
    _error: new Subject(),
    _lastRun: 0,
    get: (userId: number) => {
      //Block duplicate requests made within a specified timeout period
      if (+(new Date) - this.oneUser._lastRun >= environment.httpRefreshTimeout) {
        this.oneUser._lastRun = +new Date;
        this.httpClient
          .get(`/api/users/${userId}`)
          .subscribe((result: User) => {
            this.oneUser._observable.next(result);
          }, (error: any) => {
            this.oneUser._error.next(error);
          });
      }
      return this.oneUser._observable.asObservable();
    },
    subscribe: (unsubscribe: Subject<null>, onNext: (result: User)=>void = ()=>{}, onError: (error: any)=>void = ()=>{}, onComplete: ()=>void = ()=>{}) => {
      this.oneUser._error.pipe(takeUntil(unsubscribe)).subscribe({ next: onError });
      return this.oneUser._observable.pipe(takeUntil(unsubscribe)).subscribe({ next: onNext, error: onError, complete: onComplete });
    },
    updatePersonalDetails: (userId: number, updates: any) => {
      let request = this.httpClient
        .patch(`/api/users/${userId}`, updates)
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        let details = this.oneUser._observable.getValue();
        details.fname = updates.fname;
        details.lname = updates.lname;
        details.smsNumber = updates.smsNumber;
        details.email = updates.email;
        this.oneUser._observable.next(details);
        this.modalService.success("User Updated Successfully");
      }, (err: any) => {
        this.modalService.failure(err);
      });
      return request;
    },
    updatePassword: (userId: number, oldPass: string, newPass: string, newPassConfirm: string) => {
      let request = this.httpClient
        .patch(`/auth/update-password/${userId}`, { oldPass, newPass, newPassConfirm })
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        this.modalService.success("Password Updated Successfully");
      }, (err: any) => {
        this.modalService.failure(err.error);
      });
      return request;
    },
    updateUsername: (userId: number, username: string) => {
      let request = this.httpClient
        .patch(`/api/users/${userId}`, { username })
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        this.modalService.success("Username Updated Successfully");
      }, (err: any) => {
        this.modalService.failure(err.error);
      });

      return request;
    },
    resetTokens: (userId: number, isSelf: boolean) => {
      let request = this.httpClient
        .post(`/auth/invalidate-jwts/${userId}`, {})
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        this.modalService.success("All Sessions Ended Successfully");
        if (isSelf) {
          setTimeout(() => {
            this.authService.logout()
            .subscribe(result => {
              this.router.navigate(['/login']);
            });
          }, 2000);
        }
      }, (err: any) => {
        this.modalService.failure(err.error);
      });

      return request;
    },
    deactivate: (userId: number) => {
      let request = this.httpClient
        .delete(`/api/users/${userId}`)
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        this.modalService.success("User Deactivated Successfully");
      }, (err: any) => {
        this.modalService.failure(err.error);
      });

      return request;
    },
    restore: (userId: number) => {
      let request = this.httpClient
        .patch(`/api/users/${userId}/restore`, {})
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        this.modalService.success("User Restored Successfully");
      }, (err: any) => {
        this.modalService.failure(err.error);
      });

      return request;
    },
    updatePermissionLevel: (userId: number, newPermissionLevel: string) => {
      let request = this.httpClient
        .patch(`/api/users/${userId}/permission`, {role: newPermissionLevel})
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        this.modalService.success("User Permission Updated Successfully");
      }, (err: any) => {
        this.modalService.failure(err.error);
      });

      return request;
    }
  }

  myUser = {
    _observable: new BehaviorSubject<any>({}),
    _error: new Subject(),
    _lastRun: 0,
    get: () => {
      //Block duplicate requests made within a specified timeout period
      if (+(new Date) - this.myUser._lastRun >= environment.httpRefreshTimeout) {
        this.myUser._lastRun = +new Date;
        this.httpClient
          .get(`/api/users/self`)
          .subscribe((result: User) => {
            this.myUser._observable.next(result);
          }, (error: any) => {
            this.myUser._error.next(error);
          });
      }
      return this.myUser._observable.asObservable();
    },
    subscribe: (unsubscribe: Subject<null>, onNext: (result: User)=>void = ()=>{}, onError: (error: any)=>void = ()=>{}, onComplete: ()=>void = ()=>{}) => {
      this.myUser._error.pipe(takeUntil(unsubscribe)).subscribe({ next: onError });
      return this.myUser._observable.pipe(takeUntil(unsubscribe)).subscribe({ next: onNext, error: onError, complete: onComplete });
    },
    updatePersonalDetails: (userId: number, updates: any) => {
      let request = this.httpClient
        .patch('/api/users/self', updates)
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        let details = this.myUser._observable.getValue();
        details.fname = updates.fname;
        details.lname = updates.lname;
        details.smsNumber = updates.smsNumber;
        details.email = updates.email;
        this.myUser._observable.next(details);
        this.modalService.success("User Updated Successfully");
      }, (err: any) => {
        this.modalService.failure(err);
      });
      return request;
    },
    updatePassword: (userId: number, oldPass: string, newPass: string, newPassConfirm: string) => {
      let request = this.httpClient
        .patch('/auth/update-password/self', { oldPass, newPass, newPassConfirm })
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        this.modalService.success("Password Updated Successfully");
      }, (err: any) => {
        this.modalService.failure(err.error);
      });
      return request;
    },
    updateUsername: (userId: number, username: string) => {
      let request = this.httpClient
        .patch('/api/users/self', { username })
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        this.modalService.success("Username Updated Successfully");
      }, (err: any) => {
        this.modalService.failure(err.error);
      });

      return request;
    },
    resetTokens: (userId: number) => {
      let request = this.httpClient
        .post('/auth/invalidate-jwts/self', {})
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        this.modalService.success("All Sessions Ended Successfully");
        setTimeout(() => {
          this.authService.logout()
            .subscribe(result => {
              this.router.navigate(['/login']);
            });
        }, 2000)
      }, (err: any) => {
        this.modalService.failure(err.error);
      });

      return request;
    },
    deactivate: (userId: number) => {
      let request = this.httpClient
        .delete(`/api/users/${userId}`)
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        this.modalService.success("User Deactivated Successfully");
      }, (err: any) => {
        this.modalService.failure(err.error);
      });

      return request;
    },
    restore: (userId: number) => {
      let request = this.httpClient
        .patch(`/api/users/${userId}/restore`, {})
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        this.modalService.success("User Restored Successfully");
      }, (err: any) => {
        this.modalService.failure(err.error);
      });

      return request;
    },
    updatePermissionLevel: (userId: number, newPermissionLevel: string) => {
      let request = this.httpClient
        .patch(`/api/users/${userId}/permission`, {role: newPermissionLevel})
        .pipe(publishReplay(1), refCount());

      request.subscribe(() => {
        this.modalService.success("User Permission Updated Successfully");
      }, (err: any) => {
        this.modalService.failure(err.error);
      });

      return request;
    }
  }

  allUsers = {
    _observable: new BehaviorSubject([]),
    _error: new Subject(),
    _lastRun: 0,
    _sortResults: (users: User[]) => {
      const sorted: {
        normal: User[],
        deactivated: User[]
      } = {
        normal: [],
        deactivated: []
      };
  
      users.forEach((user: User) => {
        if (user.deletedAt) {
          sorted.deactivated.push(user);
        } else {
          sorted.normal.push(user);
        }
      });
  
      sorted.normal.sort((a, b) => {
        return a.companyId - b.companyId;
      });
  
      sorted.deactivated.sort((a, b) => {
        return a.companyId - b.companyId;
      });
  
      return sorted.normal.concat(sorted.deactivated);
    },
    get: (options: any = {}) => {
      //Block duplicate requests made within a specified timeout period
      if (+(new Date) - this.allUsers._lastRun >= environment.httpRefreshTimeout) {
        this.allUsers._lastRun = +new Date;
        this.httpClient
          .get(`/api/users?includeInactive=true&includeCompanyName=${options.includeCompanyName}`)
          .subscribe((result: User[]) => {
            this.allUsers._observable.next(this.allUsers._sortResults(result));
          }, (error: any) => {
            this.allUsers._error.next(error);
          });
      }
      return this.allUsers._observable.asObservable();
    },
    subscribe: (unsubscribe: Subject<null>, onNext: (results: User[])=>void = ()=>{}, onError: (error: any)=>void = ()=>{}, onComplete: ()=>void = ()=>{}) => {
      this.allUsers._error.pipe(takeUntil(unsubscribe)).subscribe({ next: onError });
      return this.allUsers._observable.pipe(takeUntil(unsubscribe)).subscribe({ next: onNext, error: onError, complete: onComplete });
    }
  }

  byCompany = {
    _observable: new BehaviorSubject([]),
    _error: new Subject(),
    _lastRun: 0,
    _sortResults: (users: User[]) => {
      const sorted: {
        normal: User[],
        deactivated: User[]
      } = {
        normal: [],
        deactivated: []
      };
  
      users.forEach((user: User) => {
        if (user.deletedAt) {
          sorted.deactivated.push(user);
        } else {
          sorted.normal.push(user);
        }
      });
  
      return sorted.normal.concat(sorted.deactivated);
    },
    get: (companyId: number|string = 'self') => {
      //Block duplicate requests made within a specified timeout period
      if (+(new Date) - this.byCompany._lastRun >= environment.httpRefreshTimeout) {
        this.byCompany._lastRun = +new Date;
        this.httpClient
          .get(`/api/companies/${companyId}/users`)
          .subscribe((result: User[]) => {
            this.byCompany._observable.next(this.byCompany._sortResults(result));
          }, (error: any) => {
            this.byCompany._error.next(error);
          });
      }
      return this.byCompany._observable.asObservable();
    },
    subscribe: (unsubscribe: Subject<null>, onNext: (results: User[])=>void = ()=>{}, onError: (error: any)=>void = ()=>{}, onComplete: ()=>void = ()=>{}) => {
      this.byCompany._error.pipe(takeUntil(unsubscribe)).subscribe({ next: onError });
      return this.byCompany._observable.pipe(takeUntil(unsubscribe)).subscribe({ next: onNext, error: onError, complete: onComplete });
    }
  }

  createUser = {
    create: (userData: { fname: string, lname: string, companyId: string, email: string, smsNumber: string, role: string }) => {
      return this.httpClient
        .post('/api/users/create', userData)
        .pipe(publishReplay(1), refCount());
    },
    completeSignup: (userData: { token: string, username: string, fname: string, lname: string, email: string, smsNumber: string, newPass: string, newPassConf: string }) => {
      return this.httpClient
        .patch('auth/complete-signup', userData)
        .pipe(publishReplay(1), refCount());
    }
  }

  byToken = {
    _observable: new BehaviorSubject(null),
    _error: new Subject(),
    _lastRun: 0,
    get: (token: string) => {
      //Block duplicate requests made within a specified timeout period
      if (+(new Date) - this.byToken._lastRun >= environment.httpRefreshTimeout) {
        this.byToken._lastRun = +new Date;
        this.httpClient
          .get(`/api/users/by-token/?token=${token}`)
          .subscribe((result: User) => {
            this.byToken._observable.next(result);
          }, (error: any) => {
            this.byToken._error.next(error);
          });
      }
      return this.byToken._observable.asObservable();
    },
    subscribe: (unsubscribe: Subject<null>, onNext: (results: User)=>void = ()=>{}, onError: (error: any)=>void = ()=>{}, onComplete: ()=>void = ()=>{}) => {
      this.byToken._error.pipe(takeUntil(unsubscribe)).subscribe({ next: onError });
      return this.byToken._observable.pipe(takeUntil(unsubscribe)).subscribe({ next: onNext, error: onError, complete: onComplete });
    }
  }

}
