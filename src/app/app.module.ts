import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { AppShipmentService } from "./services/appShipment.service";
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { TabsPage } from '../pages/tabs/tabs';
import { Login } from "../pages/login/login";
import { Home } from "../pages/home/home.component";
import {CreateService} from "../pages/createService/createService.component";
import {GoogleMapServices} from "./services/googleMap.services";
import {Tracking} from "../pages/tracking/tracking.component";

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    TabsPage,
    Login,
    Home,
    CreateService,
    Tracking
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    TabsPage,
    Login,
    Home,
    CreateService,
    Tracking
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, AppShipmentService, GoogleMapServices]
})
export class AppModule {}
