import { NgModule } from '@angular/core';
import { ErrorBoxComponent } from './error-box.component';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        ErrorBoxComponent
    ],
    exports: [
        ErrorBoxComponent
    ]
})
export class ErrorBoxModule {}