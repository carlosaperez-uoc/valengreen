import { Component } from '@angular/core';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { Router } from '@angular/router';

import { UserServiceService } from '../../services/user-service.service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './login-component.component.html',
  styleUrl: './login-component.component.scss'
})
export class LoginComponentComponent {

  user = new FormControl('', {nonNullable: true, validators:[Validators.required]});
  pass = new FormControl('', {nonNullable: true, validators:[Validators.required]});

  constructor(private userService: UserServiceService, private router: Router) {}

  login() {
    this.userService.login(this.user.value, this.pass.value)
      .subscribe((res: any) => {
        //console.log(res);
        this.userService.setToken(res.token);
        this.userService.setUsuario(res.usuario);
        this.router.navigate(['']);
      });
  }

  registro(){
    this.router.navigate(['/register']);
  }

}
