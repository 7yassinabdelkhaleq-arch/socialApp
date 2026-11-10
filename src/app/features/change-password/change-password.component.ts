import { Component, inject, OnInit, signal } from '@angular/core';
import { ChangePasswordService } from './services/change-password.service';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
declare const Swal: any;

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly changePasswordService = inject(ChangePasswordService);
  msgError = signal('');
  content = new FormControl();
  changPassSubscribe: Subscription = new Subscription();
  ChangePassForm = this.fb.group(
    {
      password: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
        ],
      ],
      confirmNewPassword: ['', [Validators.required]],
    },
    {
      validators: this.confirmPassword,
    },
  );
  confirmPassword(group: AbstractControl) {
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;
    if (confirmNewPassword != newPassword && confirmNewPassword != '') {
      group.get('confirmNewPassword')?.setErrors({ misMatch: true });
      return { misMatch: true };
    }
    return null;
  }
  loading = signal(false);
  submitForm(): void {
    if (this.ChangePassForm.invalid) {
      this.ChangePassForm.markAllAsTouched();
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to change your password?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1877f2',
      cancelButtonColor: '#64748b',
    }).then((result: any) => {
      if (!result.isConfirmed) return;
      const { password, newPassword } = this.ChangePassForm.getRawValue();
      this.loading.set(true);
      this.msgError.set('');
      this.changPassSubscribe.unsubscribe();
      this.changPassSubscribe = this.changePasswordService
        .changePassword({ password, newPassword })
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            Swal.fire({
              title: 'Password changed!',
              text: 'Please sign in again with your new password.',
              icon: 'success',
              confirmButtonColor: '#1877f2',
            }).then(() => {
              this.router.navigate(['/login']);
            });
            this.ChangePassForm.reset();
          },
          error: (err: HttpErrorResponse) => {
            this.msgError.set(err.error?.message ?? 'Could not change your password.');
            Swal.fire({
              title: 'Error',
              text: this.msgError(),
              icon: 'error',
              confirmButtonColor: '#1877f2',
            });
          },
        });
    });
  }
}
