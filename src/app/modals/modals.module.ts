import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalsComponent } from './modals.component';
import { ModalService } from '@services/modal/modal.service';
import { SuccessModalComponent } from './success-modal/success-modal.component';
import { FailureModalComponent } from './failure-modal/failure-modal.component';
import { SharedModule } from '@app/shared';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  declarations: [
    ModalsComponent,
    SuccessModalComponent,
    FailureModalComponent
  ],
  exports: [ModalsComponent]
})
export class ModalsModule { }
