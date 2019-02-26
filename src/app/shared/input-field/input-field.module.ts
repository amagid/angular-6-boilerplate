import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InputFieldComponent } from './input-field.component';
import { ErrorBoxModule } from '../error-box/error-box.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ErrorBoxModule
    ],
    declarations: [
        InputFieldComponent,
    ],
    exports: [
        InputFieldComponent,
    ]
})
export class InputFieldModule {}