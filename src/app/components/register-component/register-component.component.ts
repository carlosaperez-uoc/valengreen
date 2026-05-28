import { Component } from '@angular/core';
import {FormControl, Validators, FormsModule, ReactiveFormsModule, AbstractControl, ValidationErrors} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';

import { UserServiceService } from '../../services/user-service.service';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './register-component.component.html',
  styleUrl: './register-component.component.scss'
})
export class RegisterComponentComponent {
  user = new FormControl('', {nonNullable: true, validators:[Validators.required]});
  pass = new FormControl('', {nonNullable: true, validators:[Validators.required]});
  pass2 = new FormControl('', {nonNullable: true, validators:[Validators.required, this.checkPassword()]});

  constructor(private userService: UserServiceService) {}

  register() {
    this.userService.register(this.user.value, this.pass.value)
      .subscribe((res: any) => {
        //console.log(res);
      });
  }

  checkPassword(){
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value == this.pass.value) {
        return null;
      } else {
        return { error: true };
      }
    };
  }
}