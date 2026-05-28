import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AemetServiceService {

  private api = 'https://api-valengreen.onrender.com/aemet/';

  constructor(private http: HttpClient) { }

  getTempHora(hora: string) {
    return this.http.get(this.api + 'temperatura/' + hora).pipe(
      switchMap((res: any) => {
        return this.http.get(res.datos);
      }),
      map((res2: any) => {
        const dia = res2[0].prediccion.dia[0];
        const infoTemp = dia.temperatura.find((item: any) => item.periodo == hora);
        const infoCielo = dia.estadoCielo.find((item: any) => item.periodo == hora);
        const infoPrecip = dia.precipitacion.find((item: any) => item.periodo == hora);
        return {
          temp: infoTemp?.value,
          estado_cielo: infoCielo?.descripcion,
          precipitacion: infoPrecip?.value
        };
      })
    );
  }
}