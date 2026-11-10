import { Component, inject, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { PostsService } from './services/posts.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommentsComponent } from './components/comments/comments.component';
import { RouterLink } from '@angular/router';
import { Post, User } from './models/post.interface';
import { UserProfile } from '../../../profile/models/user-profile.interface';
import { ProfileService } from '../../../profile/services/profile.service';
import { SidebarSection } from '../side-left/side-left.component';
import { DatePipe } from '@angular/common';
import { ShortTimeAgoPipe } from '../../../../shared/pipes/short-time-ago-pipe';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
declare const Swal: any;

@Component({
  selector: 'app-posts',
  imports: [
    ReactiveFormsModule,
    CommentsComponent,
    RouterLink,
    DatePipe,
    ShortTimeAgoPipe,
    InfiniteScrollDirective,
  ],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css',
})
export class PostsComponent implements OnInit, OnChanges {
  private readonly profileService = inject(ProfileService);
  private readonly postsService = inject(PostsService);
  @Input() section: SidebarSection = 'feed';
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section']) {
      this.pageNumber.set(1);
      this.hasMorePosts.set(true);
      this.allPosts.set([]);
      this.loadSection(this.section);
    }
  }
  private loadSection(section: SidebarSection): void {
    switch (section) {
      case 'feed':
        this.getMyFeed();
        break;
      case 'my-posts':
        this.getMyPosts(this.userId());
        break;
      case 'community':
        this.getPostsData();
        break;
      case 'saved':
        this.getSaved();
        break;
    }
  }
  getMyFeed(): void {
    this.allPosts.set([]);
    this.postsService.getMyFeed().subscribe({
      next: (res) => {
        this.allPosts.set(res.data.posts ?? []);
      },
      error: (err) => console.error(err),
    });
  }
  getSaved(): void {
    this.allPosts.set([]);
    this.postsService.getSaved().subscribe({
      next: (res) => {
        this.allPosts.set(res.data.bookmarks ?? []);
      },
      error: (err) => console.error(err),
    });
  }
  getMyPosts(userId: string): void {
    this.allPosts.set([]);
    this.postsService.getMyPosts(userId).subscribe({
      next: (res) => {
        this.allPosts.set(res.data.posts ?? []);
      },
      error: (err) => console.error(err),
    });
  }
  content = new FormControl();
  privacy = new FormControl('public');
  msgError = signal('');
  userInfo = signal<UserProfile>({} as UserProfile);
  userId = signal('');
  file = signal<File | null>(null);
  imgSrc = signal('');
  allPosts = signal<Post[]>([]);
  ngOnInit(): void {
    this.userId.set(JSON.parse(localStorage.getItem('user')!)._id);
    this.getMyProfile();
  }
  pageNumber = signal(1);
  pageSize = 10;
  loadingPosts = signal(false);
  hasMorePosts = signal(true);
  getPostsData(): void {
    if (this.loadingPosts() || !this.hasMorePosts()) return;
    const page = this.pageNumber();
    this.loadingPosts.set(true);
    this.postsService.getAllPosts(page, this.pageSize).subscribe({
      next: (res) => {
        const newPosts: Post[] = res.data.posts ?? [];
        this.allPosts.update((currentPosts) =>
          page === 1 ? newPosts : [...currentPosts, ...newPosts],
        );
        this.hasMorePosts.set(newPosts.length === this.pageSize);
        if (newPosts.length > 0) {
          this.pageNumber.set(page + 1);
        }
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
        this.loadingPosts.set(false);
      },
    });
  }
  onScroll(): void {
    if (this.section !== 'community') return;
    this.getPostsData();
  }
  changeFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0];
    if (!selectedFile) return;
    const previousUrl = this.imgSrc();
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }
    this.file.set(selectedFile);
    this.imgSrc.set(URL.createObjectURL(selectedFile));
  }
  removeImage(): void {
    this.imgSrc.set('');
    this.file.set(null);
  }
  submitForm(e: SubmitEvent, myElement: HTMLFormElement): void {
    e.preventDefault();
    let formData = new FormData();
    if (this.content.value) {
      formData.append('body', this.content.value);
    }
    if (this.file()) {
      formData.append('image', this.file()!);
    }
    if (this.privacy.value) {
      formData.append('privacy', this.privacy.value!);
    }
    this.postsService.createPost(formData).subscribe({
      next: (res) => {
        this.getPostsData();
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        myElement.reset();
        this.removeImage();
      },
    });
  }
  deleteItem(postId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result: any) => {
      if (!result.isConfirmed) return;
      this.postsService.deletePost(postId).subscribe({
        next: (res) => {
          if (res.success) {
            this.getPostsData();
            Swal.fire({
              title: 'Deleted!',
              text: 'Your post has been deleted.',
              icon: 'success',
            });
          }
        },
        error: (err) => {
          console.log(err);
          Swal.fire({
            title: 'Error',
            text: 'Could not delete the post.',
            icon: 'error',
          });
        },
      });
    });
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
  savePost(id: string): void {
    this.postsService.savePost(id).subscribe({
      next: (res) => {
        this.updatePostBookmark(id, true);
        Swal.fire({
          title: 'Saved!',
          text: 'The post has been saved.',
          icon: 'success',
          confirmButtonColor: '#1877f2',
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          title: 'Error',
          text: 'Could not save the post.',
          icon: 'error',
          confirmButtonColor: '#1877f2',
        });
      },
    });
  }
  updatePostBookmark(id: string, bookmarked: boolean): void {
    this.allPosts.update((posts) =>
      posts.map((post) => (post._id === id ? { ...post, bookmarked } : post)),
    );
  }
  unsavePost(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this post from your saved posts?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, unsave it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
    }).then((result: any) => {
      if (!result.isConfirmed) return;
      this.postsService.unSavePost(id).subscribe({
        next: (res) => {
          this.updatePostBookmark(id, false);
          Swal.fire({
            title: 'Removed!',
            text: 'The post has been removed from your saved posts.',
            icon: 'success',
            confirmButtonColor: '#1877f2',
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            title: 'Error',
            text: 'Could not remove the post from your saved posts.',
            icon: 'error',
            confirmButtonColor: '#1877f2',
          });
        },
      });
    });
  }
  editContent = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(5000)],
  });
  editPrivacy = new FormControl('public', {
    nonNullable: true,
  });
  editingPostId = signal<string | null>(null);
  savingEdit = signal(false);
  startEdit(post: Post): void {
    this.editingPostId.set(post._id);
    this.editContent.setValue(post.body ?? '');
    this.editPrivacy.setValue(post.privacy ?? 'public');
  }
  cancelEdit(): void {
    this.editingPostId.set(null);
    this.editContent.reset('');
    this.editPrivacy.setValue('public');
  }
  saveEdit(post: Post): void {
    if (this.editContent.invalid) {
      this.editContent.markAsTouched();
      return;
    }
    const body = this.editContent.value.trim();
    const privacy = this.editPrivacy.value;
    const formData = new FormData();
    formData.append('body', body);
    formData.append('privacy', privacy);
    this.savingEdit.set(true);
    this.postsService.updatePost(post._id, formData).subscribe({
      next: () => {
        this.allPosts.update((posts) =>
          posts.map((item) => (item._id === post._id ? { ...item, body, privacy } : item)),
        );
        this.editingPostId.set(null);
        this.editContent.reset('');
        this.editPrivacy.setValue('public');
        this.savingEdit.set(false);
        this.getPostsData();
      },
      error: (err) => {
        console.error(err);
        this.savingEdit.set(false);
      },
    });
  }
  likePost(postId: string): void {
    this.postsService.likePost(postId).subscribe({
      next: () => this.updatePostLikes(postId, true),
      error: (err) => console.error(err),
    });
  }
  unLikePost(postId: string): void {
    this.postsService.unLikePost(postId).subscribe({
      next: () => this.updatePostLikes(postId, false),
      error: (err) => console.error(err),
    });
  }
  private updatePostLikes(postId: string, liked: boolean): void {
    const currentUserId = this.userId();
    this.allPosts.update((posts) =>
      posts.map((post) => {
        if (post._id !== postId) return post;
        const likes = post.likes ?? [];
        const alreadyLiked = likes.includes(currentUserId);
        if (liked && !alreadyLiked) {
          const updatedLikes = [...likes, currentUserId];
          return {
            ...post,
            likes: updatedLikes,
            likesCount: (post.likesCount ?? likes.length) + 1,
          };
        }
        if (!liked && alreadyLiked) {
          const updatedLikes = likes.filter((id) => id !== currentUserId);
          return {
            ...post,
            likes: updatedLikes,
            likesCount: Math.max(0, (post.likesCount ?? likes.length) - 1),
          };
        }
        return post;
      }),
    );
  }
  sharePost(post: Post): void {
    Swal.fire({
      title: 'Share this post',
      input: 'textarea',
      inputPlaceholder: 'Say something about this post... (optional)',
      inputAttributes: {
        'aria-label': 'Write something about this post',
        rows: '5',
      },
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Share',
      confirmButtonColor: '#1877f2',
      cancelButtonColor: '#64748b',
      reverseButtons: false,
    }).then((result: any) => {
      if (!result.isConfirmed) return;
      const message = String(result.value ?? '').trim();
      const data = message ? { body: message } : {};
      this.postsService.sharePost(post._id, data).subscribe({
        next: (res) => {
          const sharedPost = (res.data?.post ?? res.data?.sharedPost) as Post | undefined;
          this.allPosts.update((posts) => {
            const updatedPosts = posts.map((item) =>
              item._id === post._id ? { ...item, sharesCount: (item.sharesCount ?? 0) + 1 } : item,
            );
            if (!sharedPost?._id || updatedPosts.some((item) => item._id === sharedPost._id)) {
              return updatedPosts;
            }
            return [sharedPost, ...updatedPosts];
          });
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Post shared',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Could not share the post',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          });
        },
      });
    });
  }
}
