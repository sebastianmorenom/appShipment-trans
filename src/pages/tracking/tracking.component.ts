import {Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from "@angular/core";
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {AppShipmentService} from "../../app/services/appShipment.service";
import {GoogleMapServices} from "../../app/services/googleMap.services";
import { Geolocation } from 'ionic-native';
import {Home} from "../home/home.component";

declare let google;

@Component({
  templateUrl: 'tracking.html',
})
export class Tracking implements OnInit{

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('directionsPanel') directionsElement: ElementRef;
  map: any;
  markerOrigen: any;
  markerDestino: any;
  markerTrans: any;
  directionsService: any;
  directionsRender: any;
  directionsResult: any;
  directionsStatus: any;
  public markerSelected: boolean;
  iconUserDetailFrom:any;
  iconUserDetailTo:any;
  iconTransDetail:any;
  iconTrans:any;
  user:any;
  activeService:any;
  transporterPosTask:any;
  packagePickedUp:boolean;
  deliveredPackage:boolean;
  arrivalTime:any;
  loading:boolean;
  addresses:any;

  constructor(public navCtrl: NavController, private appShipmentService:AppShipmentService, private alertCtrl: AlertController,
              private navParams:NavParams, private googleMapServices:GoogleMapServices,
              private changeDetection: ChangeDetectorRef) {
    this.loading = false;
    this.packagePickedUp=false;
    this.deliveredPackage=false;
    this.markerSelected=false;
    this.markerTrans;
    this.markerOrigen = null;
    this.arrivalTime = null;
    this.addresses = {origen:{}, destino:{}};
    this.iconUserDetailFrom = {url: '../assets/icon/userPos.png'};
    this.iconUserDetailTo = {url: '../assets/icon/userPos2.png'};
    this.iconTransDetail = {url: '../assets/icon/carPos.png'};
    this.iconTrans = {url: '/assets/icon/car.png'};
    this.user = navParams.get('user');
    this.activeService = navParams.get('activeService');
    console.log(this.user);
  }

  ngOnInit(){
    this.loadMap();
  }

  loadMap(){

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRender = new google.maps.DirectionsRenderer();
    let centerMap = new google.maps.LatLng(this.activeService.origen.lat, this.activeService.origen.lng);
    let mapOptions = {
      center: centerMap,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    let origenPos = new google.maps.LatLng(this.activeService.origen.lat, this.activeService.origen.lng);
    let destinoPos = new google.maps.LatLng(this.activeService.destino.lat, this.activeService.destino.lng);
    let transPos = new google.maps.LatLng(this.activeService.transporter.pos.lat, this.activeService.transporter.pos.lng);
    this.addMarkerWithPos(1, origenPos);
    this.addMarkerWithPos(2, destinoPos);
    this.loadTransMasrker(transPos);
    this.transporterPosTask = setInterval(()=>{
      this.setTransporterPos();
    },5000);
  };

  addMarkerCenterMap(opt){
    if( opt === 1 ){
      if(this.markerOrigen){
        this.markerOrigen.setMap(null);
      }
      this.markerOrigen = this.putMarker(this.map, this.markerOrigen, this.map.getCenter(), this.iconUserDetailFrom);
    }
    if( opt === 2 ){
      if(this.markerDestino){
        this.markerDestino.setMap(null);
      }
      this.markerDestino = this.putMarker(this.map, this.markerDestino, this.map.getCenter(), this.iconUserDetailTo);
    }
  }

  addMarkerWithPos(opt, pos){

    if( opt === 1 ){
      if(this.markerOrigen){
        this.markerOrigen.setMap(null);
      }
      this.markerOrigen = this.putMarker(this.map, this.markerOrigen, pos, this.iconUserDetailFrom);
    }
    if( opt === 2 ){
      if(this.markerDestino){
        this.markerDestino.setMap(null);
      }
      this.markerDestino = this.putMarker(this.map, this.markerDestino, pos, this.iconUserDetailTo);
    }
  };

  putMarker(map, marker, pos, iconDetail, data?){
    this.directionsRender.set('directions', null);
    marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      position: pos,
      icon: iconDetail,
      data: data
    });
    return marker;
  }

  loadTransMasrker(pos){
    this.markerTrans = this.putMarker(this.map, this.markerTrans, pos, this.iconTransDetail);
  }

  pickUpPackage(markerFrom, markerTo){
    this.packagePickedUp = true;
    this.getDirections(markerFrom, markerTo);
  }

  deliveryPackage(markerFrom, markerTo){
    this.loading = true;
    let data = {
      idService: this.activeService.idService,
      idUser: this.activeService.idUser,
      idTrans: this.activeService.idTransporter,
      state:"ST"
    };
    this.appShipmentService.changeServiceState(data).subscribe(
      (response) => {
        if(response) {
          this.loading = false;
          this.deliveredPackage=true;
          this.getDirections(markerFrom, markerTo);
          markerFrom.setMap(null);
        }
      }
    );
  }

  finishService(){
    this.loading = true;
    let data = {
      idService: this.activeService.idService,
      idUser: this.activeService.idUser,
      idTrans: this.activeService.idTransporter,
      state:"FI"
    };
    this.appShipmentService.changeServiceState(data).subscribe(
      (response) => {
        if(response) {
          this.loading = false;
          clearInterval(this.transporterPosTask);
          this.navCtrl.setRoot(Home, {user:this.user});
        }
      }
    );
  }

  getDirections(markerFrom, markerTo){
    console.log("getting directions!");
    let request = {
      origin:markerFrom.position,
      destination:markerTo.position,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    this.directionsService.route(request, (response, status)=>{
      this.directionsResult = response;
      this.directionsStatus = status;
      this.printDirections(markerFrom, markerTo);
    });
  };

  printDirections(markerFrom, markerTo){
    if (this.directionsStatus === "OK"){
      if(this.directionsResult.routes.length>0 ){
        this.arrivalTime = this.directionsResult.routes[0].legs[0].duration.text;
      }
      this.directionsRender.setMap(this.map);
      this.directionsRender.setDirections(this.directionsResult);
      this.changeDetection.detectChanges();
      //this.directionsRender.setPanel(this.directionsElement.nativeElement);
    }
    else {
      alert("Cant retrieve routes");
    }
  };

  getTransporterPos(){
    this.appShipmentService.getTransporterById({id:this.activeService.transporter.id}).subscribe(
      (response) => {
        this.activeService.transporter = response;
        console.log(this.activeService);
        this.updateTransporterMarker();
      }
    );
  }

  setTransporterPos(){
    Geolocation.getCurrentPosition().then(
      (position) => {
        let data = {
          username:this.user.username,
          lat:position.coords.latitude,
          lng:position.coords.longitude
        };
        this.appShipmentService.updateLatLng(data).subscribe(
          (response) => {
            console.log(response);
            this.updateServiceData();
          }
        );
      });
  };

  updateServiceData(){
    this.addresses.origen = this.activeService.origen;
    this.addresses.destino = this.activeService.destino;
    this.appShipmentService.getServiceById(this.activeService).subscribe(
      (response)=>{
        this.activeService = response[0];
        console.log(this.activeService);
        this.updateServiceAddresses();
        this.updateTransporterMarker();
      }
    );
  }

  updateServiceAddresses(){
    this.activeService.origen = this.addresses.origen;
    this.activeService.destino = this.addresses.destino;
  }

  updateTransporterMarker(){
    let pos = new google.maps.LatLng(this.activeService.transporter.pos.lat, this.activeService.transporter.pos.lng);
    this.markerTrans.setPosition(pos);
  }

  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'Para donde vamos?!',
      subTitle: 'Por favor, asegurece de poner el marcador de origen y destino en el mapa para continuar.',
      buttons: ['OK']
    });
    alert.present();
  }
}
