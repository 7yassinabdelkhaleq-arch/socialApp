import { Component, inject, OnInit, signal } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { User } from '../../../../features/timeline/components/posts/models/post.interface';
import { UserProfile } from '../../../../features/profile/models/user-profile.interface';
import { ProfileService } from '../../../../features/profile/services/profile.service';
import { NotificationsService } from '../../../../features/notifications/services/notifications.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  userInfo = signal<UserProfile>({} as UserProfile);
  unreadCount = signal<number | null>(null);
  ngOnInit(): void {
    initFlowbite();
    this.getMyProfile();
    this.getUnreadCount();
  }
  logOut() {
    this.authService.logOut();
  }
  getMyProfile(): void {
    this.profileService.getProfileData().subscribe({
      next: (res) => {
        this.userInfo.set(res.data.user);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  getUnreadCount(): void {
    this.notificationsService.getUnreadCount().subscribe({
      next: (res) => {
        console.log(res);
        this.unreadCount.set(res.data.unreadCount);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
