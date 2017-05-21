import {Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from "@angular/core";
import {AlertController, NavController, NavParams} from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import {AppShipmentService} from "../../app/services/appShipment.service";
import { CreateService } from '../createService/createService.component'
import {GoogleMapServices} from "../../app/services/googleMap.services";

declare let google;

@Component({
  templateUrl: 'home.html',
})
export class Home implements OnInit{

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  markerOrigen: any;
  markerOrigenAddress: any;
  markerDestino: any;
  markerDestinoAddress: any;
  markerOption: number;
  markersTrans: any;
  directionsService: any;
  directionsRender: any;
  directionsResult: any;
  directionsStatus: any;
  public markerSelected: boolean;
  iconUserDetailFrom:any;
  iconUserDetailTo:any;
  iconTransDetail:any;
  iconTrans:any;
  data:any;
  user:any;
  locations:any;

  info:any;

  constructor(public navCtrl: NavController, private appShipmentService:AppShipmentService, private alertCtrl: AlertController,
              private navParams:NavParams, private googleMapServide:GoogleMapServices,
              private changeDetection: ChangeDetectorRef) {
    this.markerSelected=false;
    this.locations = {from:{}, to:{}};
    this.markersTrans = [];
    this.markerOrigen = null;
    this.iconUserDetailFrom = {url: '../assets/icon/userPos.png'};
    this.iconUserDetailTo = {url: '../assets/icon/userPos2.png'};
    this.iconTransDetail = {url: '../assets/icon/carPos.png'};
    this.iconTrans = {url: '../assets/icon/car.png'};
    this.user = navParams.get('user');
  }

  ngOnInit(){
    this.loadMap();
  }

  loadMap(){

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRender = new google.maps.DirectionsRenderer();
    Geolocation.getCurrentPosition().then(
      (position) => {
        let centerMap = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        //let centerMap = new google.maps.LatLng(4.670191, -74.058528);
        this.getTransporters(position);
        let mapOptions = {
          center: centerMap,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        this.addMarkerCenterMap(1);
        this.getAddressFromPos(1, position.coords.latitude, position.coords.longitude);
        this.map.addListener('click', (event)=>{
          if(this.markerOption){
            this.addMarkerWithPos(this.markerOption, event.latLng);
            this.getAddressFromPos(this.markerOption, event.latLng.lat(), event.latLng.lng());
            this.markerOption = undefined;
            this.changeDetection.detectChanges();
          }
        });
      },
      (err) => {
        console.log(err);
      }
    );
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

  getTransporters(position){
    this.appShipmentService.getTransporters({estado:"S", lat: position.coords.latitude, lng:  position.coords.longitude}).subscribe(
      //this.appShipmentService.getTransporters({estado:"S", lat: 4.670191, lng:  -74.058528}).subscribe(
      (data:any) => {
        this.data = data;
        this.loadTransMasrkers();
      }
    );
  }

  loadTransMasrkers(){
    for(let i=0; i<this.data.length; i++){
      let pos = new google.maps.LatLng(this.data[i].pos.lat, this.data[i].pos.lng);
      this.markersTrans.push(new google.maps.Marker());
      this.markersTrans[i] = this.putMarker(this.map, this.markersTrans[i], pos, this.iconTransDetail, this.data[i]);
    }
  }

  getDirections(){
    console.log("getting directions!");
    let request = {
      origin:this.markerOrigen.position,
      destination:this.markerDestino.position,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    this.directionsService.route(request, (response, status)=>{
      this.directionsResult = response;
      this.directionsStatus = status;
      this.printDirections()
    });
  };

  printDirections(){
    if (this.directionsStatus === "OK"){
      this.markerOrigen.setMap(null);
      this.markerDestino.setMap(null);
      this.directionsRender.setMap(this.map);
      this.directionsRender.setDirections(this.directionsResult);
    }
    else {
      alert("Cant retrieve routes");
    }
  };

  changeMarkersPosition(opt){
    this.markerOption = opt;
  }

  createService() {
    if (this.markerOrigenAddress && this.markerDestinoAddress){
      let locations = {
        origen : {
          lat:this.markerOrigen.position.lat(),
          lng:this.markerOrigen.position.lng(),
          address:this.markerOrigenAddress
        },
        destino:{
          lat:this.markerDestino.position.lat(),
          lng:this.markerDestino.position.lng(),
          address:this.markerDestinoAddress
        }
      };
      this.navCtrl.push(CreateService, {user:this.user, locations:locations});
    }
    else {
      this.presentAlert();
    }
  }

  getAddressFromPos(opt, lat, lng){
    this.googleMapServide.getAddressFromLatLng(lat, lng).subscribe(
      (data) => {
        if(opt==1){
          this.markerOrigenAddress = data.results[0].formatted_address;
        }
        if(opt==2){
          this.markerDestinoAddress = data.results[0].formatted_address;
        }
        this.changeDetection.detectChanges();
      }
    );
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
