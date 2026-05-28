import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GraphhopperServiceService {

  private url = 'http://localhost:3000/graphhopper/';
  private origen = '';
  private destino = '';

  car = 0;

  private car_res: any;

  constructor(private http: HttpClient) { }

  buscar(query: string): Observable<any> {

    return this.http.get(this.url + 'geocoder', {
      params: {
        q: query
      }
    });

  }

  setCarPoints(puntos: number){
    this.car = puntos;
  }

  getCarPoints(){
    return this.car;
  }


  setOrigen(origen: string){
    this.origen = origen;
  }

  setDestino(destino: string){
    this.destino = destino;
  }

  getOrigen(){
    return this.origen;
  }

  getDestino(){
    return this.destino;
  }

  setCarRes(res: any){
    this.car_res = res;
  }

  getCarRes(){
    return this.car_res;
  }

  getCarRoute(): Observable<any>{
    return this.http.get(this.url + 'carroute', {
      params: {
        origen: this.origen,
        destino: this.destino
      }
    });
  }
}
