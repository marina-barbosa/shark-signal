import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
 email!: string;
 password!: string;
 userName!: string;
 fullName!: string;
//  profilePicture: string = "https://randomuser.me/api/portraits/lego/1.jpg";
 profilePicture: string = "https://randomuser.me/api/portraits/lego/6.jpg";
 profileImage: File | null = null;

 authService = inject(AuthService);
 snackBar = inject(MatSnackBar);
 router = inject(Router);
 hide = signal(true);

 register() {
  let formData = new FormData();
  formData.append('email', this.email);
  formData.append('password', this.password);
  formData.append('userName', this.userName);
  formData.append('fullName', this.fullName);
  formData.append('profileImage', this.profileImage!);

  this.authService.register(formData).subscribe({
    next: () => {
      this.snackBar.open('usuário registrado com sucesso', 'Close', { duration: 3000 });
    },
    error:(error:HttpErrorResponse) => {
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

 onFileSelected(event: any) {
  const file:File = event.target.files[0];
  if(file){
    this.profileImage = file;

    const reader = new FileReader();
  
    reader.onload = (e) => {
     this.profilePicture = e.target?.result as string;
     console.log(e.target?.result);
    };
    reader.readAsDataURL(file);
    console.log(this.profilePicture);
  }  
 }
}
