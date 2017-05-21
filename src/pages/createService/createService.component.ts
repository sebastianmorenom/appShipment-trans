import {Component} from "@angular/core";
import { AlertController } from 'ionic-angular';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NavParams} from "ionic-angular";
import {AppShipmentService} from "../../app/services/appShipment.service";

@Component({
  templateUrl: 'createService.html'
})
export class CreateService {
  loading:boolean;
  dimensiones:any;
  currentDimension:number;
  formCreateService:FormGroup;
  submitAttempt:boolean;
  user:any;
  locations:any;
  activeService:any;

  constructor(private formBuilder:FormBuilder, private navParams:NavParams, private alertCtrl: AlertController,
              private appShipmentService:AppShipmentService){
    this.loading = false;
    this.submitAttempt = false;
    this.dimensiones = ['light', 'primary', 'light'];
    this.currentDimension = 1;
    this.formCreateService = formBuilder.group({
      toName: ['Laura', Validators.compose([Validators.required, Validators.maxLength(30)])],
      toIdType: ['CC', Validators.compose([Validators.required, Validators.maxLength(2)])],
      toId: ['1026781232', Validators.compose([Validators.required, Validators.pattern("^[0-9]+$")])],
      toNumTel: ['3004232678', Validators.compose([Validators.required, Validators.pattern("^[0-9]+$"), Validators.maxLength(10)])],
      contentDeclaration: ['Muchas Cosas', Validators.compose([Validators.required, Validators.maxLength(120)])],
      valueDeclaration: ['300000', Validators.compose([Validators.required, Validators.pattern("^[0-9]+$")])],
      dimension: [this.currentDimension, Validators.compose([Validators.required, Validators.pattern("^[0-9]$")])]
    });
    this.user = this.navParams.get('user');
    this.locations = this.navParams.get('locations');
  }

  selectDimension(id:number){
    this.dimensiones[id] = 'primary';
    this.dimensiones[this.currentDimension] = 'light';
    this.currentDimension = id;
    this.formCreateService.value.dimension = id;
  }

  createService(){
    this.submitAttempt=true;
    if(!this.formCreateService.valid){
      this.presentAlertForm();
    }
    else {
      let data = {
        estado:"S",
        lat: this.locations.origen.lat,
        lng: this.locations.origen.lng
      };
      this.loading = true;
      this.appShipmentService.getTransporters(data).subscribe(
        //this.appShipmentService.getTransporters({estado:"S", lat: 4.670191, lng:  -74.058528}).subscribe(
        (data:any) => {
          this.formCreateService.value.idTransportador = data[0].id;
          let serviceData = this.createServiceData();
          this.appShipmentService.createService(serviceData).subscribe(
            response => {
              this.loading=false;
              this.activeService = response;
              this.presentAlertSuccessCreateService();
              this.appShipmentService.getTransporterById({id:response.idTransporter}).subscribe(
                responseTrans => {
                  this.activeService.transporter = responseTrans;
                  console.log(this.activeService);
                }
              );
            },
            error => {
              this.presentAlertErrorCreateService();
              console.log(error);
            }
          );
        }
      );
    }
  }

  createServiceData(){
    return {
      idTransporter: this.formCreateService.value.idTransportador,
      idUser: this.user.id,
      origen: this.locations.origen,
      destino: this.locations.destino,
      addressee: {
        name: this.formCreateService.value.toName,
        idType: this.formCreateService.value.toIdType,
        id: this.formCreateService.value.toId,
        numTel: this.formCreateService.value.toNumTel,
        contentDeclaration: this.formCreateService.value.contentDeclaration,
        valueDeclaration: this.formCreateService.value.valueDeclaration,
        dimension: this.formCreateService.value.dimension
      },
      status:"SB"
    };
  }

  presentAlertForm() {
    let alert = this.alertCtrl.create({
      title: 'Datos incorrectos!',
      subTitle: 'Por favor, revise los datos, y busque nuevamente.',
      buttons: ['OK']
    });
    alert.present();
  }

  presentAlertErrorCreateService() {
    let alert = this.alertCtrl.create({
      title: 'Lo sentimos!',
      subTitle: 'No se pudo crear el servicio, porfavor intentelo nuevamente.',
      buttons: ['OK']
    });
    alert.present();
  }

  presentAlertSuccessCreateService(){
    let alert = this.alertCtrl.create({
      title: 'Perfecto!!',
      subTitle: 'Tu servicio se a creado correctamente.',
      buttons: ['OK']
    });
    alert.present();
  }

}
