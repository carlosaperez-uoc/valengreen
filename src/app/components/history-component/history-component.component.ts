import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

import { UserServiceService } from '../../services/user-service.service';

@Component({
  selector: 'app-history-component',
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './history-component.component.html',
  styleUrl: './history-component.component.scss'
})
export class HistoryComponentComponent {

  private userToken = false;
  historial: any;

  constructor(private router: Router, private user: UserServiceService){
    if(this.user.getToken().length>0){
      this.userToken = true;
    } else {
      this.router.navigate(['']);
    }
  }

  ngOnInit(){
    this.user.getHistorial().subscribe((res: any) => {
      this.historial = res;
    })
  }

  volver(){
    this.router.navigate(['']);
  }

  convertirFecha(fecha_orignal: string){
    const fecha = new Date(fecha_orignal);
    return fecha.toLocaleString();
  }
}
