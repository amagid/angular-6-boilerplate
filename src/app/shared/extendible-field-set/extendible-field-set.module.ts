import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ExtendibleFieldSetComponent } from './extendible-field-set.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        ExtendibleFieldSetComponent,
    ],
    exports: [
        ExtendibleFieldSetComponent,
    ]
})
export class ExtendibleFieldSetModule {}