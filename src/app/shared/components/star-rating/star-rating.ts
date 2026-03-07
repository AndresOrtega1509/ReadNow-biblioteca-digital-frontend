import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-star-rating',
    imports: [],
    templateUrl: './star-rating.html',
    standalone: true
})
export class StarRating {
  rating = input<number>(0);
  readonly = input<boolean>(false);
  ratingChange = output<number>();

  hoveredStar = 0;
  stars = [1, 2, 3, 4, 5];

  onHover(star: number): void {
    if (!this.readonly()) this.hoveredStar = star;
  }

  onLeave(): void {
    this.hoveredStar = 0;
  }

  onClick(star: number): void {
    if (!this.readonly()) this.ratingChange.emit(star);
  }

  isActive(star: number): boolean {
    return star <= (this.hoveredStar || this.rating());
  }
}
