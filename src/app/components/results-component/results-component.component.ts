import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { Router } from '@angular/router';

import { HeaderComponentComponent } from '../common/header-component/header-component.component';
import { FooterComponentComponent } from '../common/footer-component/footer-component.component';

import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatExpansionModule} from '@angular/material/expansion';

import { UserServiceService } from '../../services/user-service.service';
import { GraphhopperServiceService } from '../../services/graphhopper-service.service';
import { EmtServiceService } from '../../services/emt-service.service';
import { ValenciaServiceService } from '../../services/valencia-service.service';

import * as L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
const Lany = L as any;

@Component({
  selector: 'app-results-component',
  standalone: true,
  imports: [HeaderComponentComponent, FooterComponentComponent, MatExpansionModule, MatIconModule, MatButtonModule, MatCardModule, MatButtonToggleModule, MatInputModule, MatFormFieldModule],
  templateUrl: './results-component.component.html',
  styleUrl: './results-component.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsComponentComponent {
  color_class = 'bueno';
  puntos = 0;
  tipo = 0;
  eleccion = 'valenbisi';

  time = 0;
  distance = '';

  res: any;
  res_map1: any;
  res_map2: any;
  res_map3: any;

  private map1!: L.Map;
  private map2!: L.Map;
  private map3!: L.Map;

  origen = '';
  destino = '';

  clustersAparcamiento = (L as any).markerClusterGroup();
  clustersValenBisi1 = (L as any).markerClusterGroup();
  clustersValenBisi2 = (L as any).markerClusterGroup();

  map1_total = 0;
  map2_total = 0;
  map3_total = 0;

  maps_transport = '';

  co2 = 0;

  readonly panelOpenState = signal(false);

  constructor(private cdr: ChangeDetectorRef, private router: Router, private user: UserServiceService, private graphhopper: GraphhopperServiceService, private emt: EmtServiceService, private valencia: ValenciaServiceService){
    this.puntos = this.user.getPuntuacion();
    this.tipo = this.user.getTipo();
    switch (this.tipo) {
      case 1:
        this.maps_transport = "walking";
        this.color_class = 'bueno';
        this.res = this.emt.getWalkRes();
        if(this.res){
          this.time = this.convertirTiempo(this.res.plan.itineraries.itinerary.duration);
        }
        break;
      case 2:
        this.maps_transport = "bicycling";
        this.color_class = 'bueno';
        this.res = this.emt.getBikeRes();
        if (this.res){
          this.time = this.convertirTiempo(this.res.plan.itineraries.itinerary.duration);
          this.distance = (Number(this.res.plan.itineraries.itinerary.totalDist) / 1000).toFixed(2);
          this.co2 = Number(Number(this.res.plan.itineraries.itinerary.CO2).toFixed(2));
        }
        break;
      case 3:
        this.maps_transport = "transit";
        this.color_class = 'regular';
        this.res = this.emt.getBusRes();
        if (this.res){
          if(this.res.plan.itineraries.itinerary.length > 1){
            this.time = this.convertirTiempo(this.res.plan.itineraries.itinerary[0].duration);
            this.distance = (Number(this.res.plan.itineraries.itinerary[0].totalDist) / 1000).toFixed(2);
            this.co2 = Number(Number(this.res.plan.itineraries.itinerary[0].CO2).toFixed(2));
          } else {
            this.time = this.convertirTiempo(this.res.plan.itineraries.itinerary.duration);
            this.distance = (Number(this.res.plan.itineraries.itinerary.totalDist) / 1000).toFixed(2);
            this.co2 = Number(Number(this.res.plan.itineraries.itinerary.CO2).toFixed(2));
          }
        }
        
        break;
      default:
        this.maps_transport = "driving";
        this.color_class = 'malo';
        this.res = this.graphhopper.getCarRes();
        const distance = this.res?.paths[0].distance / 1000;
        this.co2 = Math.floor(distance * 130);
        if(this.res){
          this.time = this.convertirTiempo(this.res.paths[0].time);
        }
        break;
    }
  }

  ngOnInit(): void {
    //console.log(this.res);
    if (this.tipo == 2){
      setTimeout(() => {
        this.loadMap1();
        this.loadMap2();
        this.loadMap3();
        this.getAparcamientos();
        this.getValenBisi();
        this.changeBicis("valenbisi");
      }, 50);
    }
  }

  private loadMap1(): void{
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
    this.origen = this.emt.getOrigen();
    const coordenadas = this.origen.split(',');
    const lat = parseFloat(coordenadas[0]);
    const lng = parseFloat(coordenadas[1]);
    this.map1 = L.map('map1').setView([lat,lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map1);
  }

  private loadMap2(): void{
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
    this.destino = this.emt.getDestino();
    const coordenadas = this.destino.split(',');
    const lat = parseFloat(coordenadas[0]);
    const lng = parseFloat(coordenadas[1]);
    this.map2 = L.map('map2').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map2);
  }

  private loadMap3(): void{
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
      this.destino = this.emt.getDestino();
      const coordenadas = this.destino.split(',');
      const lat = parseFloat(coordenadas[0]);
      const lng = parseFloat(coordenadas[1]);
      this.map3 = L.map('map3').setView([lat, lng], 15);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(this.map3);
    }

  convertirTiempo(milisecs: string): number {
    //console.log(milisecs);
    const segundos = Math.floor(parseInt(milisecs, 10) / 1000);
    const minutos = Math.floor(segundos / 60);
    //console.log(minutos);
    return minutos;
  }
  
  volver(){
    this.router.navigate(['ruta']);
  }

  changeBicis(tipo: string){
    const div = document.getElementById('propia') as HTMLElement;
    const div2 = document.getElementById('valenbisi') as HTMLElement;
    switch(tipo){
      case 'valenbisi':
        div.style.visibility = "hidden";
        div.style.height = "0";
        
        div2.style.visibility = "visible";
        div2.style.height = "100%";
        break;
      case 'propia':
        div2.style.visibility = "hidden";
        div2.style.height = "0";

        div.style.visibility = "visible";
        div.style.height = "50%";
        break;
    }
  }

  getAparcamientos(){
      this.clustersAparcamiento = (L as any).markerClusterGroup(); //Cluster aparcamiento 
      const centroMapa = this.map3.getCenter();
      this.valencia.getAparcamientos().subscribe((res: any) => { //LLamada al service donde devuelve aparcamientos
        this.res_map3 = res;
        const aparcamientoLayer = L.geoJSON(res, { //capa de aparcamiento
          pointToLayer: (feature, latlng) => L.marker(latlng),
          filter: (feature) => {
            const geometry = feature.geometry as GeoJSON.Point;
            const coords = geometry.coordinates;
            const puntoAparcamiento = L.latLng(coords[1], coords[0]);
            const distancia = centroMapa.distanceTo(puntoAparcamiento);
            const checkDistancia = distancia <= 500;
            if(checkDistancia && feature.properties && feature.properties.numplazas){
              this.map3_total += Number(feature.properties.numplazas);
            }
            return checkDistancia;
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>Num. plazas:</strong> ${feature.properties.numplazas}`); //Popup con la información
          }
        });
        this.clustersAparcamiento.addLayer(aparcamientoLayer); //Se añade la capa al cluster (para agruparlos)
        this.clustersAparcamiento.addTo(this.map3);
      });
  }

  updateAparcamientos(input_dist: string){
    this.map3_total = 0;
    this.clustersAparcamiento.clearLayers();
    const centroMapa = this.map3.getCenter();
    const aparcamientoLayer = L.geoJSON(this.res_map3, { //capa de aparcamiento
      pointToLayer: (feature, latlng) => L.marker(latlng),
      filter: (feature) => {
        const geometry = feature.geometry as GeoJSON.Point;
        const coords = geometry.coordinates;
        const puntoAparcamiento = L.latLng(coords[1], coords[0]);
        const distancia = centroMapa.distanceTo(puntoAparcamiento);
        const checkDistancia = distancia <= Number(input_dist);
        if(checkDistancia && feature.properties && feature.properties.numplazas){
          this.map3_total += Number(feature.properties.numplazas);
        }
        return checkDistancia;
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>Num. plazas:</strong> ${feature.properties.numplazas}`); //Popup con la información
      }
    });
    this.clustersAparcamiento.addLayer(aparcamientoLayer); //Se añade la capa al cluster (para agruparlos)
    this.clustersAparcamiento.addTo(this.map3);
  }

  updateValenBisiOrg(input_dist: string){
    this.map1_total = 0;
    this.clustersValenBisi1.clearLayers();
    const centroMapa = this.map1.getCenter();
    const aparcamientoLayer = L.geoJSON(this.res_map1, { //capa de aparcamiento
      pointToLayer: (feature, latlng) => L.marker(latlng),
      filter: (feature) => {
        const geometry = feature.geometry as GeoJSON.Point;
        const coords = geometry.coordinates;
        const puntoAparcamiento = L.latLng(coords[1], coords[0]);
        const distancia = centroMapa.distanceTo(puntoAparcamiento);
        const checkDistancia = distancia <= Number(input_dist);
        if(checkDistancia && feature.properties && feature.properties.available){
          this.map1_total += Number(feature.properties.available);
        }
        return checkDistancia;
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>Disponibles:</strong> ${feature.properties.available}`); //Popup con la información
      }
    });
    this.clustersValenBisi1.addLayer(aparcamientoLayer); //Se añade la capa al cluster (para agruparlos)
    this.clustersValenBisi1.addTo(this.map1);
  }

  updateValenBisiDest(input_dist: string){
    this.map2_total = 0;
    this.clustersValenBisi2.clearLayers();
    const centroMapa = this.map2.getCenter();
    const aparcamientoLayer = L.geoJSON(this.res_map2, { //capa de aparcamiento
      pointToLayer: (feature, latlng) => L.marker(latlng),
      filter: (feature) => {
        const geometry = feature.geometry as GeoJSON.Point;
        const coords = geometry.coordinates;
        const puntoAparcamiento = L.latLng(coords[1], coords[0]);
        const distancia = centroMapa.distanceTo(puntoAparcamiento);
        const checkDistancia = distancia <= Number(input_dist);
        if(checkDistancia && feature.properties && feature.properties.total){
          const libres = feature.properties.total - feature.properties.available;
          this.map2_total += libres;
        }
        return checkDistancia;
      },
      onEachFeature: (feature, layer) => {
        const libres = feature.properties.total - feature.properties.available;
        layer.bindPopup(`<strong>Huecos libres:</strong> ${libres}`);
      }
    });
    this.clustersValenBisi2.addLayer(aparcamientoLayer); //Se añade la capa al cluster (para agruparlos)
    this.clustersValenBisi2.addTo(this.map2);
  }

  getValenBisi(){
      this.clustersValenBisi1 = (L as any).markerClusterGroup(); // Cluster valenbisi
      const centroMapa1 = this.map1.getCenter();
      const centroMapa2 = this.map2.getCenter();
  
      this.valencia.getValenBisi().subscribe((res: any) => {
        this.res_map1 = res;
        //console.log(res);
        const valenbisiLayer = L.geoJSON(res, {
          pointToLayer: (feature, latlng) => L.marker(latlng),
          filter: (feature) => {
            const geometry = feature.geometry as GeoJSON.Point;
            const coords = geometry.coordinates;
            const puntoAparcamiento = L.latLng(coords[1], coords[0]);
            const distancia = centroMapa1.distanceTo(puntoAparcamiento);
            const checkDistancia = distancia <= 500;
            if(checkDistancia && feature.properties && feature.properties.available){
              this.map1_total += Number(feature.properties.available);
            }
            this.cdr.detectChanges();
            return checkDistancia;
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>Disponibles:</strong> ${feature.properties.available}`);
          }
        });
        this.clustersValenBisi1.addLayer(valenbisiLayer);
        this.clustersValenBisi1.addTo(this.map1);
      });

      this.clustersValenBisi2 = (L as any).markerClusterGroup(); // Cluster valenbisi
  
      this.valencia.getValenBisi().subscribe((res: any) => {
        this.res_map2 = res;
        //console.log(res);
        const valenbisiLayer = L.geoJSON(res, {
          pointToLayer: (feature, latlng) => L.marker(latlng),
          filter: (feature) => {
            const geometry = feature.geometry as GeoJSON.Point;
            const coords = geometry.coordinates;
            const puntoAparcamiento = L.latLng(coords[1], coords[0]);
            const distancia = centroMapa2.distanceTo(puntoAparcamiento);
            const checkDistancia = distancia <= 500;
            if(checkDistancia && feature.properties && feature.properties.total){
              const libres = feature.properties.total - feature.properties.available;
              this.map2_total += libres;
            }
            this.cdr.detectChanges();
            return checkDistancia;
          },
          onEachFeature: (feature, layer) => {
            const libres = feature.properties.total - feature.properties.available;
            layer.bindPopup(`<strong>Huecos libres:</strong> ${libres}`);
          }
        });
        this.clustersValenBisi2.addLayer(valenbisiLayer);
        this.clustersValenBisi2.addTo(this.map2);
      });
    }

    saveRuta(){
      const origenEncoded = encodeURIComponent(this.origen);
      const destinoEncoded = encodeURIComponent(this.destino);
      const maps_url = `https://www.google.com/maps/dir/?api=1&origin=${origenEncoded}&destination=${destinoEncoded}&travelmode=${this.maps_transport}`
      if(this.user.getToken().length>0){
        try {
          this.user.guardarRuta(this.tipo, this.puntos).subscribe((res) => {
            //console.log(res);
            alert("Enhorabuena! Has ganado " + this.puntos + " puntos!");
            window.open(maps_url, '_blank');
            this.router.navigate(['/']);
          });
        } catch (e) {
          //console.log(e);
        }
      } else {
        window.open(maps_url, '_blank');
        this.router.navigate(['/']);
      }
    }
    
}
