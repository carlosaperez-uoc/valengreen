import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';

import { HeaderComponentComponent } from '../common/header-component/header-component.component';
import { FooterComponentComponent } from '../common/footer-component/footer-component.component';

import { AemetServiceService } from '../../services/aemet-service.service';
import { ValenciaServiceService } from '../../services/valencia-service.service';
import { GraphhopperServiceService } from '../../services/graphhopper-service.service';
import { EmtServiceService } from '../../services/emt-service.service';

import {FormControl, Validators, FormsModule, ReactiveFormsModule, AbstractControl, ValidationErrors} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { debounceTime } from 'rxjs/operators';

import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-search-component',
  standalone: true,
  imports: [HeaderComponentComponent, FooterComponentComponent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatCardModule, MatAutocompleteModule],
  templateUrl: './search-component.component.html',
  styleUrl: './search-component.component.scss'
})
export class SearchComponentComponent implements AfterViewInit {

  private leaflet = window.L; 

  origen = new FormControl('');
  destino = new FormControl('');

  temp = 0;
  estado_cielo = 'Despejado';
  precipitacion = 0;
  calidad = 'Buena';

  modoSeleccion: 'origen' | 'destino' | null = null;

  private map!: L.Map;
  private markerOrigen: L.Marker | null = null;
  private markerDestino: L.Marker | null = null;
  private markerUbicacion: L.CircleMarker | null = null;

  resultadosOrigen: any[] = [];
  resultadosDestino: any[] = [];

  private origenString = '';
  private destinoString = '';

  constructor(private router: Router, private aemetService: AemetServiceService, private valencia: ValenciaServiceService, private graphhopper: GraphhopperServiceService, private emt: EmtServiceService) {}

  ngOnInit(): void {
    this.getTemp();
    this.getCalidad();

    this.origen.valueChanges.pipe(debounceTime(400)).subscribe(value => this.buscar(value, 'origen'));

    this.destino.valueChanges.pipe(debounceTime(400)).subscribe(value => this.buscar(value, 'destino'));
  }

  ngAfterViewInit(): void {
    this.loadMap();
    this.getAparcamientos();
    this.cargarUbicacionActual();
  }

  private loadMap(): void{
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
    this.map = L.map('map').setView([39.46975, -0.37739], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.modoSeleccion) {
        const coords = e.latlng;
        const coordInputString = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
        if (this.modoSeleccion == 'origen') {
          this.origenString = coordInputString;
          if (this.markerOrigen){
            this.map.removeLayer(this.markerOrigen);
          }
          this.markerOrigen = L.marker(coords, {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })
          }).addTo(this.map);
          this.origen.setValue(coordInputString);
        } else {
          this.destinoString = coordInputString;
          if (this.markerDestino){
            this.map.removeLayer(this.markerDestino);
          }
          this.markerDestino = L.marker(coords, {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })
          }).addTo(this.map);
          this.destino.setValue(coordInputString);
        }
        this.modoSeleccion = null;
      }
    });
  }

  seleccionarLugar(lugar: any, tipo: 'origen' | 'destino') {
    const lat = lugar.point.lat;
    const long = lugar.point.lng;
    const latlongString = lat + ', ' + long;
    const coords: L.LatLngExpression = [lat, long];
  
    if (tipo == 'origen') {
      this.origenString = latlongString;
      if (this.markerOrigen) this.map.removeLayer(this.markerOrigen);
  
      this.markerOrigen = L.marker(coords, {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(this.map);
  
      this.origen.setValue(lugar.name, { emitEvent: false });
      this.resultadosOrigen = [];
  
    } else {
      this.destinoString = latlongString;
      if (this.markerDestino) this.map.removeLayer(this.markerDestino);
  
      this.markerDestino = L.marker(coords, {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(this.map);
  
      this.destino.setValue(lugar.name, { emitEvent: false });
      this.resultadosDestino = [];
    }
  
    this.map.setView(coords, 15);
  }

  cargarUbicacionActual() {
    if (!navigator.geolocation) return;
  
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
  
      const coordString = `${lat}, ${lng}`;
  
      this.origenString = coordString;
  
      this.origen.setValue('Tu ubicación', { emitEvent: false });
  
      if (this.markerUbicacion) {
        this.map.removeLayer(this.markerUbicacion);
      }
  
      this.markerUbicacion = L.circleMarker([lat, lng], {
        radius: 8,
        color: '#2196f3',
        fillColor: '#2196f3',
        fillOpacity: 0.8
      }).addTo(this.map);
  
      this.map.setView([lat, lng], 15);
    });
  }

  getTemp(){
    const hora = new Date().getHours().toString().padStart(2, '0');

    this.aemetService.getTempHora(hora).subscribe(res => {
      this.temp = res.temp;
      this.estado_cielo = res.estado_cielo;
      this.precipitacion = res.precipitacion*100;

      //Modificacion puntos

      if(this.precipitacion >= 50){
        this.emt.setBusPoints(1);
        this.emt.setBikePoints(1);
        this.emt.setWalkPoints(1);
      }
      if(this.temp > 35){
        this.emt.setBusPoints(1);
      }
      //console.log(res);
    });
  }

  getCalidad(){
    this.valencia.getCalidadAireCentro().subscribe(res => {
      this.calidad = res;
      if((this.calidad != 'Buena') && (this.calidad != 'Razonablemente Buena')){
        this.graphhopper.setCarPoints(-1);
        this.emt.setBusPoints(1);
      }
    });
  }

  getAparcamientos(){
    const clustersAparcamiento = this.leaflet.markerClusterGroup(); //Cluster aparcamiento 
    const clustersValenBisi = this.leaflet.markerClusterGroup(); // Cluster valenbisi

    this.valencia.getAparcamientos().subscribe((res: any) => { //LLamada al service donde devuelve aparcamientos
      const aparcamientoLayer = L.geoJSON(res, { //capa de aparcamiento
        pointToLayer: (feature, latlng) => L.marker(latlng),
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`<strong>Num. plazas:</strong> ${feature.properties.numplazas}`); //Popup con la información
        }
      });
      clustersAparcamiento.addLayer(aparcamientoLayer); //Se añade la capa al cluster (para agruparlos)
  

      const capas = { // definimos el nombre a mostrar
        "Aparcamientos bicicleta": clustersAparcamiento
      };

      L.control.layers({}, capas, { collapsed: false }).addTo(this.map); //la añadimos al mapa
    });

    this.valencia.getValenBisi().subscribe((res: any) => {
      const valenbisiLayer = L.geoJSON(res, {
        pointToLayer: (feature, latlng) => L.marker(latlng),
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`<strong>Disponibles:</strong> ${feature.properties.available}`);
        }
      });
      clustersValenBisi.addLayer(valenbisiLayer);
  

      const capas = {
        "Disponibilidad Valenbisi": clustersValenBisi
      };

      L.control.layers({}, capas, { collapsed: false }).addTo(this.map);
    });
  }
  
  buscar(texto: string | null, tipo: 'origen' | 'destino') {
    if (!texto || texto.length < 3) {
      if (tipo == 'origen'){
        this.resultadosOrigen = [];
      } else{
        this.resultadosDestino = [];
      }
      return;
    }
  
    this.graphhopper.buscar(texto).subscribe((data: any) => {
      if (tipo == 'origen') {
        this.resultadosOrigen = data.hits;
      } else {
        this.resultadosDestino = data.hits;
      }
    });
  }

  buscarRuta(){
    //console.log(this.origenString);
    this.emt.setOrigen(this.origenString);
    this.graphhopper.setOrigen(this.origenString);
    //console.log(this.destinoString);
    this.emt.setDestino(this.destinoString);
    this.graphhopper.setDestino(this.destinoString);
    this.router.navigate(['/ruta']);
  }

}
