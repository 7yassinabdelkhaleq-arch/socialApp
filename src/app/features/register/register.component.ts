import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { validate } from '@angular/forms/signals';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, RouterLinkActive],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  registerForm = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', Validators.required],
      gender: ['', [Validators.required, Validators.pattern('^(male|female)$')]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
        ],
      ],
      rePassword: ['', [Validators.required]],
    },
    {
      validators: this.confirmPassword,
      updateOn: 'submit',
    },
  );
  loading = signal(false);
  msgError = signal('');
  registerSubscribe: Subscription = new Subscription();
  today = new Date().toISOString().split('T')[0];
  confirmPassword(group: AbstractControl) {
    const password = group.get('password')?.value;
    const rePassword = group.get('rePassword')?.value;
    if (rePassword != password && rePassword != '') {
      group.get('rePassword')?.setErrors({ misMatch: true });
      return { misMatch: true };
    }
    return null;
  }
  submitForm(): void {
    if (this.registerForm.valid) {
      const { username, ...formData } = this.registerForm.getRawValue();
      const payload = username?.trim() ? { ...formData, username: username.trim() } : formData;
      this.registerSubscribe.unsubscribe();
      this.loading.set(true);
      this.registerSubscribe = this.authService.signUp(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.router.navigate(['/login']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.msgError.set(err.error.message);
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
