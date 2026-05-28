import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmtServiceService {

  private origen = '';
  private destino = '';
  private hora = '';
  private fecha = '';
  private fechaEng = '';

  private walk = 0;
  private bus = 0;
  private bike = 0;

  private walk_res: any;
  private bike_res: any;
  private bus_res: any;

  private url = 'https://geoportal.emtvalencia.es/opentripplanner-api-webapp/ws/plan?';

  constructor(private http: HttpClient) { }

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

  setWalkPoints(puntos: number){
    this.walk = puntos;
  }

  setBikePoints(puntos: number){
    this.bike = puntos;
  }

  setBusPoints(puntos: number){
    this.bus = puntos;
  }

  getWalkPoints(){
    return this.walk;
  }

  getBikePoints(){
    return this.bike;
  }

  getBusPoints(){
    return this.bus;
  }

  setWalkRes(res: any){
    this.walk_res = res;
  }

  setBusRes(res: any){
    this.bus_res = res;
  }

  setBikeRes(res: any){
    this.bike_res = res;
  }

  getWalkRes(){
    return this.walk_res;
  }

  getBusRes(){
    return this.bus_res;
  }

  getBikeRes(){
    return this.bike_res;
  }

  updateHora(){
    const now = new Date();

    this.hora = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    this.fecha = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + String(now.getFullYear()).slice(-2);
    this.fechaEng = String(now.getMonth() + 1).padStart(2, '0') + '/' + String(now.getDate()).padStart(2, '0') + '/' + String(now.getFullYear()).slice(-2);
  }

  getWalkRoute(){
    const encodeOrigen = encodeURIComponent(this.origen);
    const encodeDestino = encodeURIComponent(this.destino);
    this.updateHora();
    const getParams = 'fromPlace='+encodeOrigen+'&toPlace='+encodeDestino+'&time='+this.hora+'%20%20%20%20&date='+this.fecha+'&mode=WALK&arriveBy=false&wheelchair=false%20%20%20%20&optimize=TRANSFERS&maxWalkDistance=450%20%20%20%20&dateEnglish='+this.fechaEng+'&intermediatePlaces';
    return this.http.get(this.url + getParams);
  }

  getBikeRoute(){
    const encodeOrigen = encodeURIComponent(this.origen);
    const encodeDestino = encodeURIComponent(this.destino);
    this.updateHora();
    const getParams = 'fromPlace='+encodeOrigen+'&toPlace='+encodeDestino+'&time='+this.hora+'%20%20%20%20&date='+this.fecha+'&mode=BICYCLE&arriveBy=false&wheelchair=false%20%20%20%20&optimize=TRANSFERS&maxWalkDistance=450%20%20%20%20&dateEnglish='+this.fechaEng+'&intermediatePlaces';
    return this.http.get(this.url + getParams);
  }

  getBusRoute(){
    const encodeOrigen = encodeURIComponent(this.origen);
    const encodeDestino = encodeURIComponent(this.destino);
    this.updateHora();
    const getParams = 'fromPlace='+encodeOrigen+'&toPlace='+encodeDestino+'&time='+this.hora+'%20%20%20%20&date='+this.fecha+'&mode=BUS&arriveBy=false&wheelchair=false%20%20%20%20&optimize=TRANSFERS&maxWalkDistance=450%20%20%20%20&dateEnglish='+this.fechaEng+'&intermediatePlaces';
    return this.http.get(this.url + getParams);
  }
}
