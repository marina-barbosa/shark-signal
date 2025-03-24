import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ButtonComponent } from "../components/button/button.component";

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email!: string;
  password!: string;
  hide = signal(true);

  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);

  login() {
    this.authService.isLoading.set(true);
    this.authService.login(this.email, this.password)
      .subscribe({
        next: () => {
          this.authService.me().subscribe();
          this.snackBar.open('Login efetuado com sucesso', 'Close', { duration: 3000 });
          this.authService.isLoading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          let err = error.error as ApiResponse<string>;
          this.snackBar.open(err.error ?? 'Algo deu errado', 'Close', { duration: 3000 });
          this.authService.isLoading.set(false);
        },
        complete: () => {
          this.router.navigate(['/']);
          this.authService.isLoading.set(false);
        }
      });
  }

  togglePassword(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
