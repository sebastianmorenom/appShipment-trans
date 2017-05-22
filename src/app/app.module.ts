import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { AppShipmentService } from "./services/appShipment.service";
import { MyApp } from './app.component';
import { Login } from "../pages/login/login";
import { Home } from "../pages/home/home.component";
import {GoogleMapServices} from "./services/googleMap.services";
import {Tracking} from "../pages/tracking/tracking.component";

@NgModule({
  declarations: [
    MyApp,
    Login,
    Home,
    Tracking
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Login,
    Home,
    Tracking
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, AppShipmentService, GoogleMapServices]
})
export class AppModule {}
