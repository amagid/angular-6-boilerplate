import { Component, OnInit, OnDestroy, HostBinding, HostListener } from '@angular/core';
import { ModalService } from '@services/modal/modal.service';
import { ModalCall } from '@datatypes';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthenticationService } from '@app/core';

@Component({
  selector: 'modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss']
})
export class ModalsComponent implements OnInit, OnDestroy {

  notifyOnDestroy: Subject<null> = new Subject();
  activeModal: number = 0;
  modalData: any = null;
  resetFields: Subject<null> = new Subject<null>();

  @HostBinding('class.active') active: boolean
  constructor(private modalService: ModalService, private authService: AuthenticationService) { }

  ngOnInit() {
    this.modalService.subscribe(this.notifyOnDestroy, (modalCall: ModalCall) => { this.activateModal(modalCall); });

    this.authService.onLogin(this.notifyOnDestroy, (loggedIn: boolean) => {
      if (!loggedIn) {
        this.resetFields.next();
      }
    });
  }

  ngOnDestroy() {
    this.notifyOnDestroy.next();
    this.notifyOnDestroy.complete();
  }

  activateModal(modalCall: ModalCall) {
    this.activeModal = modalCall.modalNum;
    this.active = !!this.activeModal;
    //If this was a deactivation, keep the old data around for a bit (so it doesn't disappear while the deactivating modal is still visible)
    if (modalCall.modalNum !== 0) {
      this.modalData = Object.assign({}, modalCall.data);
      this.resetFields.next();
    }
  }

  @HostListener('click')
  deactivate() {
    this.activateModal({ modalNum: 0, data: {} });
  }

}
