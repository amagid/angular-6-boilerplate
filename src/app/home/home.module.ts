import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '@app/shared';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { PanelService } from '../../services/panel/panel.service';
import { PanelComponent } from './panel/panel.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    HomeRoutingModule
  ],
  declarations: [
    HomeComponent,
    PanelComponent
  ],
  exports: [

  ]
})
export class HomeModule { }
