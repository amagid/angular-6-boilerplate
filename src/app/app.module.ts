import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '@env/environment';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { HomeModule } from './home/home.module';
import { LoginModule } from './login/login.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PipesModule } from '@pipes';
import { ModalsModule } from './modals/modals.module';

import { ModalService } from '@services/modal/modal.service';
import { PanelService } from '@services/panel/panel.service';
import { UserService } from '@services/user/user.service';
import { MapService } from '@services/map/map.service';
import { HttpErrorService } from '@services/http-error/http-error.service';

@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    NgbModule.forRoot(),
    CoreModule,
    SharedModule,
    HomeModule,
    LoginModule,
    AppRoutingModule,
    PipesModule,
    ModalsModule
  ],
  declarations: [AppComponent],
  providers: [
    ModalService,
    PanelService,
    UserService,
    MapService,
    HttpErrorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
