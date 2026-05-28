import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  private api = 'https://api-valengreen.onrender.com/';

  private token = '';
  private usuario = '';
  private tipo = 0;
  private puntuacion = 0;

  constructor(private http: HttpClient) { }

  login(user: string, pass: string) {
    return this.http.post(this.api +'/login', {"usuario": user, "password": pass});
  }

  register(user: string, pass: string) {
    return this.http.post(this.api +'/register', {"usuario": user, "password": pass});
  }

  getPuntos(){
    if(this.token.length>0){
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`
      });
      return this.http.get(this.api + '/puntuaciones', {headers});
    } else {
      return of({ total: '0' });
    }
  }

  guardarRuta(tipo: number, puntuacion: number){
    //this.puntuacion = puntuacion;
    if(this.token.length>0){
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`
      });
      const body = {
        id_medio: tipo,
        puntuacion: puntuacion
      };
      return this.http.post(this.api + '/ruta', body, { headers });
    } else {
      throw new Error('Usuario sin permisos');
    }
  }

  getPreferencias(){
    if(this.token.length>0){
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`
      });
      return this.http.get(this.api + '/preferencias', {headers});
    } else {
      return of({ total: '0' });
    }
  }

  updatePreferencias(id_medio: number){
    if(this.token.length>0){
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`
      });
      const body = {
        id_medio: id_medio
      };
      return this.http.post(this.api + '/preferencias', body, { headers });
    } else {
      throw new Error('Usuario sin permisos');
    }
  }

  deletePreferncias(id_medio: number){
    if(this.token.length>0){
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`
      });
      const body = {
        id_medio: id_medio
      };
      return this.http.delete(this.api + '/preferencias', { headers: headers, body });
    } else {
      throw new Error('Usuario sin permisos');
    }
  }

  getHistorial(){
    if(this.token.length>0){
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`
      });
      return this.http.get(this.api + '/rutas', {headers});
    } else {
      return of({ total: '0' });
    }
  }

  setPuntuacion(puntuacion: number){
    this.puntuacion = puntuacion;
  }

  getPuntuacion(){
    return this.puntuacion;
  }

  setToken(token: string){
    this.token = token;
  }

  getToken(){
    return this.token;
  }

  setUsuario(usuario: string){
    this.usuario = usuario;
  }

  getUsuario(){
    return this.usuario;
  }

  setTipo(tipo: number){
    this.tipo = tipo;
  }

  getTipo(){
    return this.tipo;
  }
}
