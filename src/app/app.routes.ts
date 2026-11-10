import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { ProfileComponent } from './features/profile/profile.component';
import { TimelineComponent } from './features/timeline/timeline.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { ForgetPasswordComponent } from './features/forget-password/forget-password.component';
import { NotfoundComponent } from './features/notfound/notfound.component';
import { authGuard } from './core/auth/guard/auth-guard';
import { guestGuardGuard } from './core/auth/guard/guest-guard-guard';
import { DetailsComponent } from './features/details/details.component';
import { AllSuggestedComponent } from './features/all-suggested/all-suggested.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuardGuard],
    children: [
      { path: 'login', component: LoginComponent, title: 'Sign In | Route Posts' },
      { path: 'register', component: RegisterComponent, title: 'Create Account | Route Posts' },
      { path: 'forget', component: ForgetPasswordComponent },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'timeline', component: TimelineComponent, title: 'Home Feed | Route Posts' },
      { path: 'profile', component: ProfileComponent, title: 'Profile | Route Posts' },
      {
        path: 'notifications',
        component: NotificationsComponent,
        title: 'Notifications | Route Posts',
      },
      {
        path: 'change',
        component: ChangePasswordComponent,
        title: 'Change Password | Route Posts',
      },
      {
        path: 'details/:id',
        component: DetailsComponent,
        title: 'Post Details| Route Posts',
      },
      {
        path: 'suggestions',
        component: AllSuggestedComponent,
        title: 'Suggested Friends | Route Posts',
      },
    ],
  },
  { path: 'notfound', component: NotfoundComponent },
  { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
];
