import { Component, ChangeDetectorRef } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { Router } from '@angular/router';

import { UserServiceService } from '../../../services/user-service.service';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './header-component.component.html',
  styleUrl: './header-component.component.scss'
})
export class HeaderComponentComponent {

  userToken: boolean = false;
  userName: string | null = '';
  header_puntos = 0;

  constructor(private user: UserServiceService, private router: Router, private cdr: ChangeDetectorRef){
    if(this.user.getToken().length>0){
      this.userToken = true;
      
    } 
    
  }

  ngOnInit(){
    if(this.userToken){
      this.user.getPuntos()?.subscribe((res: any) => {
        this.header_puntos = res.total;
        this.cdr.detectChanges();
      });
      if(this.user.getUsuario().length>0){
        this.userName = this.user.getUsuario();
        this.cdr.detectChanges();
      }
    }
  }

  login(){
    this.router.navigate(['/login']);
  }

  preferences(){
    this.router.navigate(['/preferences']);
  }

  history(){
    this.router.navigate(['/history']);
  }

}
