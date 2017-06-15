import {Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from "@angular/core";
import {AlertController, NavController, NavParams} from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import {AppShipmentService} from "../../app/services/appShipment.service";
import {GoogleMapServices} from "../../app/services/googleMap.services";
import {Tracking} from "../tracking/tracking.component";

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
  findServiceTask:any;
  transporterPosTask:any;
  activeService:any;
  addresses:any;

  constructor(public navCtrl: NavController, private appShipmentService:AppShipmentService, private alertCtrl: AlertController,
              private navParams:NavParams, private googleMapServices:GoogleMapServices,
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
    this.findServiceTask = setInterval(() => {
      this.findService();
    }, 5000);
    this.transporterPosTask = setInterval(()=>{
      this.setTransporterPos();
    },5000);
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
        //this.getTransporters(position);
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
    if(this.markerOrigen){
      this.markerOrigen.setMap(null);
    }
    this.markerOrigen = this.putMarker(this.map, this.markerOrigen, this.map.getCenter(), this.iconTransDetail);
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
      //this.navCtrl.push(CreateService, {user:this.user, locations:locations});
    }
    else {
      this.presentAlert();
    }
  }

  getAddressFromPos(opt, lat, lng){
    this.googleMapServices.getAddressFromLatLng(lat, lng).subscribe(
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

  findService(){
    console.log("finding services")
    this.appShipmentService.getActiveService(this.user).subscribe(
      (response:any) => {
        if (response.length > 0) {
          this.activeService = response[0];
          console.log(this.activeService)
          if (this.activeService.status !== "FI"){
            clearInterval(this.findServiceTask);
            clearInterval(this.transporterPosTask);
            this.presentAlert();
          }
        }
      }
    );
  }

  getFormattedAddresses(){
    this.googleMapServices.getAddressFromLatLng(this.activeService.origen.lat, this.activeService.origen.lng).subscribe(
      dataOrigen => {
        this.activeService.origen.address = dataOrigen.results[0].formatted_address;
        this.googleMapServices.getAddressFromLatLng(this.activeService.destino.lat, this.activeService.destino.lng).subscribe(
          dataDestino => {
            this.activeService.destino.address = dataDestino.results[0].formatted_address;
            this.navCtrl.setRoot(Tracking, {user:this.user, activeService:this.activeService});
          }
        )
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
            this.updateTransporterMarker(data.lat, data.lng);
          }
        );
      });
  };

  updateTransporterMarker(lat, lng){
    let pos = new google.maps.LatLng(lat,lng);
    this.markerOrigen.setPosition(pos);
    this.map.panTo(pos);
  }

  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'Servicio encontrado!!',
      subTitle: 'Se a solicitado un servicio dentro de tu alcance.',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.getFormattedAddresses();
          }
        }
      ]
    });
    alert.present();
  }
}
