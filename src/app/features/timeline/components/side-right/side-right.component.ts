import { Component, inject, OnInit, signal } from '@angular/core';
import { SuggestedSecService } from './services/suggested-sec.service';
import { Suggest } from './models/suggest.interface';
import { RouterLink } from '@angular/router';
import { PostsService } from '../posts/services/posts.service';
declare const Swal: any;

@Component({
  selector: 'app-side-right',
  imports: [RouterLink],
  templateUrl: './side-right.component.html',
  styleUrl: './side-right.component.css',
})
export class SideRightComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly suggestedSecService = inject(SuggestedSecService);
  allSuggested = signal<Suggest[]>([]);
  ngOnInit(): void {
    this.getSuggested();
  }
  getSuggested(): void {
    this.suggestedSecService.getSuggestedFriends().subscribe({
      next: (res) => {
        console.log(res.data.suggestions);
        this.allSuggested.set(res.data.suggestions);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  followUser(userId: string): void {
    this.postsService.followUsers(userId).subscribe({
      next: (res) => {
        this.getSuggested();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'You are now following this user',
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
          title: 'Could not follow this user',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      },
    });
  }
}
