import { Component, inject, OnInit, signal } from '@angular/core';
import { ProfileService } from './services/profile.service';
import { UserProfile } from './models/user-profile.interface';
import { UserPosts } from './models/user-posts.interface';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
declare const Swal: any;

@Component({
  selector: 'app-profile',
  imports: [RouterLink, DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  profileData = signal<UserProfile>({} as UserProfile);
  activeTab = signal<'posts' | 'saved'>('posts');
  userPosts = signal<UserPosts[]>([]);
  myPostedCount = 0;
  file = signal<File | null>(null);
  cover = signal<File | null>(null);
  userId = signal('');
  showCoverPreview = signal(false);
  showPhotoPreview = signal(false);
  ngOnInit(): void {
    this.getMyProfile();
  }
  getMyProfile(): void {
    this.profileService.getProfileData().subscribe({
      next: (res) => {
        console.log(res.data.user);
        const user = res.data.user;
        this.profileData.set(user);
        const id = user._id;
        this.userId.set(id);
        this.getUserPosts(id);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  removeCover(): void {
    this.profileData.update((profile) => ({
      ...profile,
      cover: '',
    }));
  }
  getUserPosts(userId: string): void {
    this.activeTab.set('posts');
    this.userPosts.set([]);
    this.profileService.getUserPosts(userId).subscribe({
      next: (res) => {
        console.log(res.data.posts);
        const posts = res.data.posts;
        this.userPosts.set(res.data.posts);
        this.myPostedCount = this.userPosts().length;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  getUserBookMarke(): void {
    this.activeTab.set('saved');
    this.userPosts.set([]);
    this.profileService.getBookMarks().subscribe({
      next: (res) => {
        console.log(res.data.bookmarks);
        this.userPosts.set(res.data.bookmarks);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  changeFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0];
    if (!selectedFile) return;
    this.file.set(selectedFile);
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update your profile photo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Okay',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1877f2',
      cancelButtonColor: '#64748b',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.submitForm();
      } else {
        this.file.set(null);
      }
      input.value = '';
    });
  }
  changeCoverFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0];
    if (!selectedFile) return;
    this.cover.set(selectedFile);
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update your cover photo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Okay',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1877f2',
      cancelButtonColor: '#64748b',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.submitFormCover();
      } else {
        this.cover.set(null);
      }
      input.value = '';
    });
  }
  submitFormCover(): void {
    const selectedFile = this.cover();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('cover', selectedFile);
    this.profileService.uploadProfileCover(formData).subscribe({
      next: (res) => {
        console.log(res);
        this.cover.set(null);
        this.getMyProfile();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  submitForm(e?: SubmitEvent): void {
    e?.preventDefault();
    const selectedFile = this.file();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('photo', selectedFile);
    this.profileService.uploadProfilePhoto(formData).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
