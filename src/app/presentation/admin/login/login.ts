import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      try {
        await this.authService.loginWithEmailAndPassword(email, password);
        // Navigation is handled in the auth service
      } catch (error: any) {
        if (error.message.includes('Admin privileges required')) {
          this.errorMessage = `Access denied. This user doesn't have admin privileges. 
                              Visit /admin/setup to configure admin access, or check the setup instructions.`;
        } else {
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      } finally {
        this.isLoading = false;
      }
    }
  }

  navigateToSetup() {
    this.router.navigate(['/admin/setup']);
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
