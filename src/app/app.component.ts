import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Login } from "../pages/login/login";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage = Login;

  constructor(private platform: Platform) {
    this.platform = platform;
  }
}
