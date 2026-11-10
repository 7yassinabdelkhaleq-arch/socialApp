import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostsService } from '../timeline/components/posts/services/posts.service';
import { PostsComponent } from '../timeline/components/posts/posts.component';
import { Post, User } from '../timeline/components/posts/models/post.interface';
import { CommentsComponent } from '../timeline/components/posts/components/comments/comments.component';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShortTimeAgoPipe } from '../../shared/pipes/short-time-ago-pipe';
declare const Swal: any;

@Component({
  selector: 'app-details',
  imports: [RouterLink, PostsComponent, CommentsComponent, ReactiveFormsModule, ShortTimeAgoPipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly postsService = inject(PostsService);
  private readonly router = inject(Router);
  private updateBookmarkState(bookmarked: boolean): void {
    this.singlePostData.update((post) => ({
      ...post,
      bookmarked,
    }));
  }
  userInfo = signal<User | null>(null);
  userId = signal('');
  singlePostData = signal<Post>({} as Post);
  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.getSinglePost(params.get('id')!);
      this.userId.set(JSON.parse(localStorage.getItem('user')!)._id);
      this.userInfo.set(JSON.parse(localStorage.getItem('user')!));
    });
  }
  getSinglePost(id: string): void {
    this.postsService.getSinglePost(id).subscribe({
      next: (res) => {
        this.singlePostData.set(res.data.post);
      },
      error: (err) => {
        console.log(err);
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
            this.router.navigate(['/timeline']);
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
  savePost(id: string): void {
    this.postsService.savePost(id).subscribe({
      next: (res) => {
        this.updateBookmarkState(true);
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
          this.updateBookmarkState(false);
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
  isEditing = signal(false);
  savingEdit = signal(false);
  editContent = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(5000)],
  });
  editPrivacy = new FormControl('public', {
    nonNullable: true,
  });
  startEdit(): void {
    const post = this.singlePostData();
    this.editContent.setValue(post.body ?? '');
    this.editPrivacy.setValue(post.privacy ?? 'public');
    this.isEditing.set(true);
  }
  cancelEdit(): void {
    const post = this.singlePostData();
    this.editContent.setValue(post.body ?? '');
    this.editPrivacy.setValue(post.privacy ?? 'public');
    this.isEditing.set(false);
  }
  saveEdit(): void {
    if (this.editContent.invalid) {
      this.editContent.markAsTouched();
      return;
    }
    const post = this.singlePostData();
    const body = this.editContent.value.trim();
    const privacy = this.editPrivacy.value;
    const formData = new FormData();
    formData.append('body', body);
    formData.append('privacy', privacy);
    this.savingEdit.set(true);
    this.postsService.updatePost(post._id, formData).subscribe({
      next: () => {
        this.singlePostData.update((currentPost) => ({
          ...currentPost,
          body,
          privacy,
        }));
        this.isEditing.set(false);
        this.savingEdit.set(false);
      },
      error: (err) => {
        console.error(err);
        this.savingEdit.set(false);
      },
    });
  }
  likePost(postId: string): void {
    this.postsService.likePost(postId).subscribe({
      next: () => this.updateSinglePostLikes(true),
      error: (err) => console.error(err),
    });
  }
  unLikePost(postId: string): void {
    this.postsService.unLikePost(postId).subscribe({
      next: () => this.updateSinglePostLikes(false),
      error: (err) => console.error(err),
    });
  }
  private updateSinglePostLikes(liked: boolean): void {
    const currentUserId = this.userId();
    this.singlePostData.update((post) => {
      if (!post?._id) return post;
      const likes = post.likes ?? [];
      const alreadyLiked = likes.includes(currentUserId);
      if (liked && !alreadyLiked) {
        return {
          ...post,
          likes: [...likes, currentUserId],
          likesCount: (post.likesCount ?? likes.length) + 1,
        };
      }
      if (!liked && alreadyLiked) {
        return {
          ...post,
          likes: likes.filter((id) => id !== currentUserId),
          likesCount: Math.max(0, (post.likesCount ?? likes.length) - 1),
        };
      }
      return post;
    });
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
        next: () => {
          this.singlePostData.update((currentPost) => {
            if (currentPost._id !== post._id) return currentPost;
            return {
              ...currentPost,
              sharesCount: (currentPost.sharesCount ?? 0) + 1,
            };
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
