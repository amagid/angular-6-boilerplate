import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs';
import { map, catchError, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ModalCall } from '@datatypes';

@Injectable()
export class ModalService implements OnDestroy {

  nextModalCall: ModalCall
  modalUpdateObservable: BehaviorSubject<ModalCall>
  _deactivationObservable: Subject<null>
  notifyOnDestroy: Subject<null>

  constructor() {
    this.modalUpdateObservable = new BehaviorSubject<ModalCall>({ modalNum: 0, data: {} });
    this._deactivationObservable = new Subject();
    this.notifyOnDestroy = new Subject();
  }

  ngOnDestroy() {
    this.modalUpdateObservable.complete();
    this._deactivationObservable.complete();
    this.notifyOnDestroy.next();
    this.notifyOnDestroy.complete();
  }

  subscribe(unsubscribe: Subject<null>, onNext: (value: ModalCall) => void = (value: any)=>{}, onError: (value: ModalCall) => void = (value: any)=>{}, onComplete:  () => void = ()=>{}) {
    this.modalUpdateObservable.pipe(takeUntil(unsubscribe)).subscribe(onNext, onError, onComplete);
  }

  activateModal(modalNum: number, data: any) {
    this.modalUpdateObservable.next({ modalNum, data });
    return this._deactivationObservable.asObservable();
  }

  deactivateModals() {
    this.modalUpdateObservable.next({ modalNum: 0, data: {} });
    setTimeout(() => {
      this._deactivationObservable.next();
    }, 400);
  }

  success(message: string, nextModalCall?: ModalCall, options?: { timeout?: number }) {
    this.activateModal(-1, { message });
    setTimeout(() => {
      this.deactivateModals();
      if (nextModalCall) {
        this.activateModal(nextModalCall.modalNum, nextModalCall.data);
      }
    }, (options && options.timeout) || 1500);
    return this._deactivationObservable.asObservable();
  }

  /**
   * Display a failure modal
   * @param data The data to display. Data.message is currently the only parameter
   * @param options Options for display. Set options.clearModals=true to clear all modals when message deactivates. Set options.timeout to specify a different timeout than the default 2000ms. Set options.replaceData to replace modal data on reload.
   */
  failure(data: any = {}, options: any = {}) {
    if (!options.clearModals) {
      //Store current state so we can go back
      this.nextModalCall = this.modalUpdateObservable.getValue();
    }

    this.activateModal(-2, { message: data.message });
    
    setTimeout(() => {
      this.deactivateModals();
      if (!options.clearModals) {
        this.activateModal(this.nextModalCall.modalNum, options.replaceData || this.nextModalCall.data);
      }
    }, options.timeout || 2000);
    return this._deactivationObservable.asObservable();
  }

  /**
   * Helper method for when an Unknown Error occurs. Calls Failure() with a standardized error message.
   * @param options See Failure() method for details
   */
  unknownError(options: any = {}) {
    return this.failure({ message: 'Unknown Error' }, options);
  }
}
