import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommentsService } from '../../services/comments.service';
import { Comment } from '../../models/comment.interface';
import { User } from '../../models/post.interface';
import { UserProfile } from '../../../../../profile/models/user-profile.interface';
import { ProfileService } from '../../../../../profile/services/profile.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { validate } from '@angular/forms/signals';
import { ShortTimeAgoPipe } from '../../../../../../shared/pipes/short-time-ago-pipe';
import { DatePipe } from '@angular/common';
declare const Swal: any;

@Component({
  selector: 'app-comments',
  imports: [ReactiveFormsModule, RouterLink, ShortTimeAgoPipe, DatePipe],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css',
})
export class CommentsComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly commentsService = inject(CommentsService);
  commentContent = new FormControl('', [Validators.minLength(2)]);
  openCommentMenuId = signal<string | null>(null);
  CFile = signal<File | null>(null);
  CImgSrc = signal('');
  postId = input.required<string>();
  userInfo = signal<UserProfile>({} as UserProfile);
  allComments = signal<Comment[]>([]);
  allCommentsReplies = signal<Comment[]>([]);
  ngOnInit(): void {
    this.getComments();
    this.getMyProfile();
  }
  getComments(): void {
    this.commentsService.getAllComments(this.postId()).subscribe({
      next: (res) => {
        console.log(res);
        this.allComments.set(res.data.comments);
      },
      error: (err) => {
        console.log(err);
      },
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
  changeFileComment(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0];
    if (!selectedFile) return;
    const previousUrl = this.CImgSrc();
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }
    this.CFile.set(selectedFile);
    this.CImgSrc.set(URL.createObjectURL(selectedFile));
  }
  removeImage(): void {
    this.CImgSrc.set('');
    this.CFile.set(null);
  }
  toggleCommentMenu(commentId: string): void {
    this.openCommentMenuId.update((currentId) => (currentId === commentId ? null : commentId));
  }
  submitForm(e: SubmitEvent, myElement: HTMLFormElement): void {
    e.preventDefault();
    let formData = new FormData();
    if (this.commentContent.value) {
      formData.append('content', this.commentContent.value);
    }
    if (this.CFile()) {
      formData.append('image', this.CFile()!);
    }
    this.commentsService.createComment(this.postId(), formData).subscribe({
      next: (res) => {
        console.log(res);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Comment added',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
        this.getComments();
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
  deleteComment(postId: string, id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this comment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
    }).then((result: any) => {
      if (!result.isConfirmed) return;
      this.commentsService.deleteComment(postId, id).subscribe({
        next: () => {
          this.getComments();
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Comment deleted',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            title: 'Error',
            text: 'Could not delete the comment.',
            icon: 'error',
            confirmButtonColor: '#1877f2',
          });
        },
      });
    });
  }
  editingCommentId = signal<string | null>(null);
  editCommentContent = new FormControl('', {
    nonNullable: true,
    validators: [Validators.minLength(2)],
  });
  startEditComment(id: string, content: string): void {
    this.editingCommentId.set(id);
    this.editCommentContent.setValue(content ?? '');
  }
  cancelEditComment(): void {
    this.editingCommentId.set(null);
    this.editCommentContent.reset('');
  }
  saveEditComment(commentId: string): void {
    if (this.editCommentContent.invalid) {
      this.editCommentContent.markAsTouched();
      return;
    }
    const content = this.editCommentContent.value.trim();
    if (content.length === 1) {
      this.editCommentContent.setErrors({ minlength: true });
      return;
    }
    this.commentsService.updateCommint(this.postId(), { content }, commentId).subscribe({
      next: (res) => {
        const updatedContent = res.data?.comment?.content ?? content;
        this.allComments.update((comments) =>
          comments.map((comment) =>
            comment._id === commentId ? { ...comment, content: updatedContent } : comment,
          ),
        );
        this.editingCommentId.set(null);
        this.editCommentContent.reset('');
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  getCommentReplay(postId: string, commentId: string): void {
    this.activeRepliesCommentId.set(commentId);
    this.commentsService.getCommentReplayes(postId, commentId).subscribe({
      next: (res) => {
        this.allCommentsReplies.set(res.data.replies ?? []);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  openReplyMenuId = signal<string | null>(null);
  editingReplyId = signal<string | null>(null);
  replyEditContent = new FormControl('', {
    nonNullable: true,
    validators: [Validators.minLength(2)],
  });
  activeRepliesCommentId = signal<string | null>(null);
  toggleReplyMenu(replyId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openReplyMenuId.update((currentId) => (currentId === replyId ? null : replyId));
  }
  startEditReply(replyId: string, content: string): void {
    this.openReplyMenuId.set(null);
    this.editingReplyId.set(replyId);
    this.replyEditContent.setValue(content ?? '');
  }
  cancelEditReply(): void {
    this.editingReplyId.set(null);
    this.replyEditContent.reset('');
  }
  saveEditReply(replyId: string): void {
    const content = this.replyEditContent.value.trim();
    if (content.length < 2) {
      this.replyEditContent.setErrors({ minlength: true });
      this.replyEditContent.markAsTouched();
      return;
    }
    this.commentsService.updateCommint(this.postId(), { content }, replyId).subscribe({
      next: (res) => {
        const updatedContent = res.data?.reply?.content ?? content;
        this.allCommentsReplies.update((replies) =>
          replies.map((reply) =>
            reply._id === replyId ? { ...reply, content: updatedContent } : reply,
          ),
        );
        this.cancelEditReply();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  deleteReply(replyId: string): void {
    this.openReplyMenuId.set(null);
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this reply?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
    }).then((result: any) => {
      if (!result.isConfirmed) return;
      this.commentsService.deleteComment(this.postId(), replyId).subscribe({
        next: () => {
          this.allCommentsReplies.update((replies) =>
            replies.filter((reply) => reply._id !== replyId),
          );
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Reply deleted',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            title: 'Error',
            text: 'Could not delete the reply.',
            icon: 'error',
            confirmButtonColor: '#1877f2',
          });
        },
      });
    });
  }
  replyContents = signal<Record<string, string>>({});
  replyFiles = signal<Record<string, File | null>>({});
  replyImageSrcs = signal<Record<string, string>>({});
  sendingReplyForId = signal<string | null>(null);
  setReplyContent(commentId: string, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.replyContents.update((contents) => ({
      ...contents,
      [commentId]: value,
    }));
  }
  changeReplyFile(commentId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const oldUrl = this.replyImageSrcs()[commentId];
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    this.replyFiles.update((files) => ({
      ...files,
      [commentId]: file,
    }));
    this.replyImageSrcs.update((images) => ({
      ...images,
      [commentId]: URL.createObjectURL(file),
    }));
  }
  removeReplyImage(commentId: string, input: HTMLInputElement): void {
    const oldUrl = this.replyImageSrcs()[commentId];
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    this.replyFiles.update((files) => ({
      ...files,
      [commentId]: null,
    }));
    this.replyImageSrcs.update((images) => ({
      ...images,
      [commentId]: '',
    }));
    input.value = '';
  }
  submitReply(event: SubmitEvent, commentId: string, fileInput: HTMLInputElement): void {
    event.preventDefault();
    const content = (this.replyContents()[commentId] ?? '').trim();
    const image = this.replyFiles()[commentId] ?? null;
    if (content.length === 1) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'اكتب حرفين على الأقل',
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }
    if (!content && !image) return;
    if (this.sendingReplyForId() === commentId) return;
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (image) formData.append('image', image);
    this.sendingReplyForId.set(commentId);
    this.commentsService.creatReply(this.postId(), commentId, formData).subscribe({
      next: () => {
        this.replyContents.update((contents) => ({
          ...contents,
          [commentId]: '',
        }));
        const oldUrl = this.replyImageSrcs()[commentId];
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        this.replyFiles.update((files) => ({
          ...files,
          [commentId]: null,
        }));
        this.replyImageSrcs.update((images) => ({
          ...images,
          [commentId]: '',
        }));
        fileInput.value = '';
        this.getCommentReplay(this.postId(), commentId);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Reply added',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
        this.sendingReplyForId.set(null);
      },
      error: (err) => {
        console.error(err);
        this.sendingReplyForId.set(null);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Could not add the reply',
          showConfirmButton: false,
          timer: 2500,
        });
      },
    });
  }
  likeComment(postId: string, commentId: string): void {
    const currentUserId = this.userInfo()._id;
    const comment = this.allComments().find((item) => item._id === commentId);
    if (!comment || !currentUserId) return;
    const wasLiked = comment.likes?.includes(currentUserId) ?? false;
    this.commentsService.commentLike(postId, commentId).subscribe({
      next: () => {
        this.allComments.update((comments) =>
          comments.map((item) => {
            if (item._id !== commentId) return item;
            const likes = item.likes ?? [];
            return {
              ...item,
              likes: wasLiked
                ? likes.filter((id) => id !== currentUserId)
                : [...likes, currentUserId],
            };
          }),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  likeReply(postId: string, replyId: string): void {
    const currentUserId = this.userInfo()._id;
    const reply = this.allCommentsReplies().find((item) => item._id === replyId);
    if (!reply || !currentUserId) return;
    const wasLiked = reply.likes?.includes(currentUserId) ?? false;
    this.commentsService.commentLike(postId, replyId).subscribe({
      next: () => {
        this.allCommentsReplies.update((replies) =>
          replies.map((item) => {
            if (item._id !== replyId) return item;
            const likes = item.likes ?? [];
            return {
              ...item,
              likes: wasLiked
                ? likes.filter((id) => id !== currentUserId)
                : [...likes, currentUserId],
            };
          }),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
