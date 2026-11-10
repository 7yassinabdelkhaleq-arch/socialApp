import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Suggest } from '../timeline/components/side-right/models/suggest.interface';
import { SuggestedSecService } from '../timeline/components/side-right/services/suggested-sec.service';
import { PostsService } from '../timeline/components/posts/services/posts.service';
declare const Swal: any;

@Component({
  selector: 'app-all-suggested',
  imports: [RouterLink],
  templateUrl: './all-suggested.component.html',
  styleUrl: './all-suggested.component.css',
})
export class AllSuggestedComponent {
  private readonly suggestedSecService = inject(SuggestedSecService);
  private readonly postsService = inject(PostsService);
  allSuggested = signal<Suggest[]>([]);
  limit = signal(20);
  searchQuery = signal('');
  loading = signal(false);
  ngOnInit(): void {
    this.getSuggested();
  }
  filteredSuggested = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.allSuggested();
    }
    return this.allSuggested().filter((suggest) =>
      `${suggest.name} ${suggest.username}`.toLowerCase().includes(query),
    );
  });
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }
  getSuggested(): void {
    this.loading.set(true);
    this.suggestedSecService.getSuggestedFriends(this.limit()).subscribe({
      next: (res) => {
        this.allSuggested.set(res.data.suggestions);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
      },
    });
  }
  viewMoreSuggest(): void {
    if (this.loading()) return;
    this.limit.set(Math.min(this.limit() + 10, 50));
    this.getSuggested();
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
