import { Component } from '@angular/core';
import { Http } from '@angular/http';
import {AlertController, NavController} from 'ionic-angular';
import { AppShipmentService } from "../../app/services/appShipment.service";
import {Home} from "../home/home.component";
import {GoogleMapServices} from "../../app/services/googleMap.services";
import {Tracking} from "../tracking/tracking.component";

@Component({
    templateUrl: 'login.html'
})
export class Login {
  errorLoginMessage:string = "Se a producido un error al iniciar sesión. Intentelo mas tarde.";
  errorActiveServicesMessage:string = "Se a producido un error consultando los servicios activos. Intentelo de nuevo.";
  errorLoginTitle:string = "Error";
  loading:boolean;
  loginData = {
      username:"",
      password:""
  };
  activeService:any;

  constructor(private http:Http, private navCtrl: NavController, private appShipmentService: AppShipmentService,
              private alertCtrl: AlertController, private googleMapServices:GoogleMapServices) {
    this.loginData.username = "fizz@seajoker.com";
    this.loginData.password = "fizz";
    this.loading = false;
  }

  login(){
    this.loading = true;
    this.appShipmentService.login(this.loginData).subscribe(
      (data:any) => {
        this.verifyCurrentService(data);
      },
      (error:any) => {
        this.loading = false;
        this.presentAlert(this.errorLoginTitle, this.errorLoginMessage);
        console.log(error)
      },
      () => {
        this.loading = false;
      }
    );
  }

  verifyCurrentService(userInfo){
    this.appShipmentService.getActiveService(userInfo).subscribe(
      (response:any) => {
        this.loading = false;
        if (response.length > 0) {
          this.activeService = response[0];
          this.googleMapServices.getAddressFromLatLng(this.activeService.origen.lat, this.activeService.origen.lng).subscribe(
            dataOrigen => {
              this.activeService.origen.address = dataOrigen.results[0].formatted_address;
              this.googleMapServices.getAddressFromLatLng(this.activeService.origen.lat, this.activeService.origen.lng).subscribe(
                dataDestino => {
                  this.activeService.destino.address = dataDestino.results[0].formatted_address;
                  this.navCtrl.setRoot(Tracking, {user:userInfo, activeService:this.activeService});
                }
              )
            }
          );
        }
        else{
          this.navCtrl.setRoot(Home, {user:userInfo});
        }
      },
      (error:any) => {
        this.presentAlert(this.errorLoginTitle, this.errorActiveServicesMessage);
        console.log(error);
      }
    );
  }

  presentAlert(title,msg) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }
}
