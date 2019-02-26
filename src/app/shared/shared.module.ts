import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderComponent } from './loader/loader.component';
import { ErrorBoxModule } from './error-box/error-box.module';
import { InputFieldModule } from './input-field/input-field.module';
import { OnOffSwitchComponent } from './on-off-switch/on-off-switch.component';
import { ExtendibleFieldSetModule } from '@app/shared/extendible-field-set/extendible-field-set.module';
import { ExtendibleFieldSetComponent } from '@app/shared/extendible-field-set/extendible-field-set.component';

@NgModule({
  imports: [
    CommonModule,
    InputFieldModule,
    ErrorBoxModule,
    ExtendibleFieldSetModule
  ],
  declarations: [
    LoaderComponent,
    OnOffSwitchComponent,
  ],
  exports: [
    LoaderComponent,
    InputFieldModule,
    ErrorBoxModule,
    OnOffSwitchComponent,
    ExtendibleFieldSetComponent
  ]
})
export class SharedModule { }
