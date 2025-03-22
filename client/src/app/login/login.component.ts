import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response';
import { Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email!: string;
  password!: string;
  hide = signal(true);

  private authService = inject(AuthServiceService);
  snackBar = inject(MatSnackBar);
 router = inject(Router);

  login(){
    this.authService.login(this.email, this.password)
    .subscribe({
      next: () => {
        this.snackBar.open('Login efetuado com sucesso', 'Close', { duration: 3000 });
      },
      error: (error:HttpErrorResponse) => {
        let err = error.error as ApiResponse<string>;
        this.snackBar.open(err.error ?? 'Algo deu errado', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.router.navigate(['/']);
      }
    });
  }

  togglePassword(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
   }
}
