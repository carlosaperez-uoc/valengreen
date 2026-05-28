import { Component, model } from '@angular/core';
import { Router } from '@angular/router';

import { HeaderComponentComponent } from '../common/header-component/header-component.component';
import { FooterComponentComponent } from '../common/footer-component/footer-component.component';

import {FormControl, Validators, FormsModule, ReactiveFormsModule, AbstractControl, ValidationErrors} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatCheckboxModule} from '@angular/material/checkbox';

import { GraphhopperServiceService } from '../../services/graphhopper-service.service';
import { EmtServiceService } from '../../services/emt-service.service';
import { UserServiceService } from '../../services/user-service.service';

@Component({
  selector: 'app-route-component',
  standalone: true,
  imports: [HeaderComponentComponent, FooterComponentComponent, FormsModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatCardModule, MatAutocompleteModule],
  templateUrl: './route-component.component.html',
  styleUrl: './route-component.component.scss'
})
export class RouteComponentComponent {
  
  readonly bike = model(true);
  readonly bus = model(true);
  readonly walk = model(true);
  readonly car = model(true);

  bike_class = 'bueno';
  walk_class = 'bueno';
  bus_class = 'regular';
  car_class = 'malo';

  walk_time = 0;
  bike_time = 0;
  bus_time = 0;
  car_time = 0;

  walk_error = '';
  bike_error = '';
  bus_error = '';
  car_error = '';

  walk_points = 2;
  bike_points = 2;
  bus_points = 1;
  car_points = -1;

  walk_res: any;
  bike_res: any;
  bus_res: any;
  car_res: any;

  preferences: any;

  constructor(private router: Router, private graphhopper: GraphhopperServiceService, private emt: EmtServiceService, private user: UserServiceService) {}

  ngOnInit(){
    if ((this.graphhopper.getOrigen().length < 1 || this.graphhopper.getOrigen() == null) && (this.emt.getOrigen().length < 1 || this.emt.getOrigen() == null)){
      if(this.walk_res || this.bike_res || this.bus_res || this.car_res){
        this.walk_res = this.emt.getWalkRes();
        this.bike_res = this.emt.getBikeRes();
        this.bus_res = this.emt.getBusRes();
        this.car_res = this.graphhopper.getCarRes();
      } else {
        this.router.navigate(['']);
      }
    } else {
      const orrigen = document.getElementById("origen") as HTMLInputElement;
      const destino = document.getElementById("destino") as HTMLInputElement;
      this.walk_points = this.walk_points + this.emt.getWalkPoints();
      this.bike_points = this.bike_points + this.emt.getBikePoints();
      this.bus_points = this.bus_points + this.emt.getBusPoints();
      this.car_points = this.car_points + this.graphhopper.getCarPoints();
      if((this.graphhopper.getOrigen().length < 1 || this.graphhopper.getDestino() == null)){
        orrigen.value = this.emt.getOrigen();
      } else {
        orrigen.value = this.graphhopper.getOrigen();
      }

      if((this.graphhopper.getDestino().length < 1 || this.graphhopper.getDestino() == null)){
        destino.value = this.emt.getDestino();
      } else {
        destino.value = this.graphhopper.getDestino();
      }
      this.getRutas();
      this.user.getPreferencias()?.subscribe((res: any) => {
        this.preferences = res;
        this.loadPreferences();
      });
    }
  }

  loadPreferences(){
    for (let i=0; i<this.preferences.length; i++){
      //console.log(this.preferences[i]);
      const idMedio = Number(this.preferences[i]?.id_medio);
      this.enableDisable(idMedio);
      if (idMedio == 1){
        this.walk.set(false);
      } else if (idMedio == 2){
         this.bike.set(false);
      } else if (idMedio == 3){
        this.bus.set(false);
      } else if (idMedio == 4){
        this.car.set(false);
      }
    }
  }

  nueva(){
    this.router.navigate(['']);
  }

  enableDisable(id: number){
    let element = document.getElementById(id.toString()) as HTMLElement;
    //console.log(element);
    if(element.style.display == 'none'){
      element.style.display = 'block';
    } else {
      element.style.display = 'none';
    }
  }

  getRutas(){
    if(this.walk()){
      if(!this.walk_res){
        this.emt.getWalkRoute().subscribe((res: any) => {
          if(res.error){
            this.walk_points = 0;
            this.walk_error = res.error.msg;
          } else {
            this.walk_res = res;
            this.emt.setWalkRes(res);
            this.walk_time = this.convertirTiempo(res.plan.itineraries.itinerary.duration);
          }
          //console.log(res);
        });
      } else {
        this.walk_time = this.convertirTiempo(this.walk_res.plan.itineraries.itinerary.duration);
      }
    }
    if (this.bike()){
      if(!this.bike_res){
        this.emt.getBikeRoute().subscribe((res: any) => {
          //console.log(res);
          if(res.error){
            this.bike_points = 0;
            this.bike_error = res.error.msg;
          } else {
            this.bike_res = res;
            this.emt.setBikeRes(res);
            this.bike_time = this.convertirTiempo(res.plan.itineraries.itinerary.duration);
          }
        });
      } else {
        this.bike_time = this.convertirTiempo(this.bike_res.plan.itineraries.itinerary.duration);
      }
    }
    if(this.bus()){
      if(!this.bus_res){
        this.emt.getBusRoute().subscribe((res: any) => {
          //console.log(res);
          if(res.error){
            this.bus_points = 0;
            this.bus_error = res.error.msg;
          } else {
            this.bus_res = res;
            this.emt.setBusRes(res);
            if(res.plan.itineraries.itinerary.length > 1){
              this.bus_time = this.convertirTiempo(res.plan.itineraries.itinerary[0].duration);
            } else {
              this.bus_time = this.convertirTiempo(res.plan.itineraries.itinerary.duration);
  
            }
          }
        });
      } else {
        if(this.bus_res.plan.itineraries.itinerary.length > 1){
          this.bus_time = this.convertirTiempo(this.bus_res.plan.itineraries.itinerary[0].duration);
        } else {
          this.bus_time = this.convertirTiempo(this.bus_res.plan.itineraries.itinerary.duration);

        }
      }
      
    }
    if(this.car()){
      if(!this.car_res){
        this.graphhopper.getCarRoute().subscribe((res: any) => {
          //console.log(res);
          if(res.message){
            this.car_points = 0;
            this.car_error = 'Error obteniendo ruta en coche';
          } else {
            this.car_res = res;
            this.graphhopper.setCarRes(res);
            this.car_time = this.convertirTiempo(res.paths[0].time);
          }
        })
      } else{
        this.car_time = this.convertirTiempo(this.car_res.paths[0].time);
      }
      
    }
  }

  saveResult(tipo: number){
    this.user.setTipo(tipo);
    let puntos: number;
  
    switch (tipo) {
      case 1:
        const origenEncoded = encodeURIComponent(this.graphhopper.getOrigen());
        const destinoEncoded = encodeURIComponent(this.graphhopper.getDestino());
        const maps_url = `https://www.google.com/maps/dir/?api=1&origin=${origenEncoded}&destination=${destinoEncoded}&travelmode=walking`
        puntos = this.walk_points;
        this.user.setPuntuacion(puntos);
        try {
          this.user.guardarRuta(tipo, puntos).subscribe((res) => {
            //console.log(res);
            alert("Enhorabuena! Has ganado " + puntos + "!");
            window.open(maps_url, '_blank');
            this.router.navigate(['/']);
          });
        } catch (e) {
          //console.log(e);
          window.open(maps_url, '_blank');
          this.router.navigate(['/']);
        }
        break;
      case 2:
        puntos = this.bike_points;
        this.user.setPuntuacion(puntos);
        this.router.navigate(['/results']);
        break;
      case 3:
        puntos = this.bus_points;
        this.user.setPuntuacion(puntos);
        this.router.navigate(['/results']);
        break;
      default:
        puntos = this.car_points;
        this.user.setPuntuacion(puntos);
        this.router.navigate(['/results']);
        break;
    }

    /*try {
      this.user.guardarRuta(tipo, puntos).subscribe((res) => {
        //console.log(res);
      });
    } catch (e) {
      //console.log(e);
    }*/
    
  }

  convertirTiempo(milisecs: string): number {
    //console.log(milisecs);
    const segundos = Math.floor(parseInt(milisecs, 10) / 1000);
    const minutos = Math.floor(segundos / 60);
    //console.log(minutos);
    return minutos;
  }

}
