import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortTimeAgo',
  standalone: true,
  pure: false,
})
export class ShortTimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = new Date(value).getTime();
    if (Number.isNaN(date)) return '';
    const seconds = Math.max(0, Math.floor((Date.now() - date) / 1000));
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    if (months >= 12) {
      return `${Math.floor(months / 12)}y`;
    }
    if (months >= 1) {
      return `${months}mo`;
    }
    return `${days}d`;
  }
}
