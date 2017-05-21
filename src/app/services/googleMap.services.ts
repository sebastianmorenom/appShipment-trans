import { Injectable } from "@angular/core";
import {Http, Response} from "@angular/http";
import 'rxjs/RX';

@Injectable()
export class GoogleMapServices {

  private url:String = "http://maps.googleapis.com/maps/api/geocode/json?latlng=";

  constructor (private http:Http){}

  getAddressFromLatLng(lat, lng){
    return this.http.get(this.url+lat+","+lng).map(
      (response:Response) => {
        return response.json();
      }
    );
  }

}
