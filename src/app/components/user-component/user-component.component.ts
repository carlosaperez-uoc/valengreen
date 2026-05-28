import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';

import { UserServiceService } from '../../services/user-service.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-user-component',
  standalone: true,
  imports: [MatButtonModule, ReactiveFormsModule, MatCheckboxModule],
  templateUrl: './user-component.component.html',
  styleUrl: './user-component.component.scss'
})
export class UserComponentComponent {

  private userToken = false;
  puntos = 0;

  preferences: any;
  
  preferencias_transporte = new FormGroup({
    1: new FormControl(true),
    2: new FormControl(true),
    3: new FormControl(true),
    4: new FormControl(true)
  });

  userName = '';

  constructor(private router: Router, private user: UserServiceService){
    if(this.user.getToken().length>0){
      this.userToken = true;
    } else {
      this.router.navigate(['']);
    }
    if(this.user.getUsuario().length>0){
      this.userName = this.user.getUsuario();
    }
  }

  ngOnInit(){
    if(this.userToken){
      this.user.getPuntos()?.subscribe((res: any) => {
        this.puntos = res.total;
      });
      this.user.getPreferencias()?.subscribe((res: any) => {
        this.preferences = res;
        this.loadChecks();
      });
    }
  }

  loadChecks(){
    for(let i=0; i<this.preferences.length; i++){
      this.preferencias_transporte.get(this.preferences[i].id_medio.toString())?.setValue(false);
    }
  }

  volver(){
    this.router.navigate(['']);
  }

  history(){
    this.router.navigate(['/history']);
  }

  savePreferences(){
    const valores = this.preferencias_transporte.value;
    Object.entries(valores).forEach(([id, marcado]) => {
      if (marcado == false) {
        let existe = false;
        for (let i=0; i<this.preferences.length; i++){
          //console.log(this.preferences[i]);
          //console.log(id);
          if(this.preferences[i].id_medio == id){
            existe = true;
            break;
          }
        }
        if(!existe){
          this.user.updatePreferencias(Number(id)).subscribe((res: any) => {
            //console.log(res);
          });
        }
      } else {
        for (let i=0; i<this.preferences.length; i++){
          //console.log(this.preferences[i]);
          //console.log(id);
          if(this.preferences[i].id_medio == id){
            this.user.deletePreferncias(Number(id)).subscribe((res: any) => {
              //console.log(res);
            });
            break;
          }
        }
      }
    });
  }

  cerrar(){
    this.user.setToken('');
    this.router.navigate(['']);
  }
}
