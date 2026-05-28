import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValenciaServiceService {

  private contaminacion = 'https://geoportal.valencia.es/server/rest/services/OPENDATA/MedioAmbiente/MapServer/156/query?where=1=1&outFields=*&f=json';
  private aparcamientos = 'https://geoportal.valencia.es/server/rest/services/OPENDATA/Trafico/MapServer/206/query?where=1=1&outFields=*&f=geojson';
  private valenbisi = 'https://geoportal.valencia.es/server/rest/services/OPENDATA/Trafico/MapServer/228/query?where=1=1&outFields=*&f=geojson';

  constructor(private http: HttpClient) { }

  getCalidadAireCentro() {
    return this.http.get(this.contaminacion).pipe(
      map((res: any) => {
        const estacionCentro = res.features.find((f: any) => f.attributes.nombre === 'Centro');
        ////console.log(estacionCentro);
        return estacionCentro?.attributes.calidad_am;
      })
    );
  }

  getAparcamientos() {
    return this.http.get(this.aparcamientos);
  }

  getValenBisi(){
    return this.http.get(this.valenbisi);
  }
}