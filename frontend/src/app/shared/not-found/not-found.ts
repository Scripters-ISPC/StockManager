import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  styleUrl: './not-found.css',
  templateUrl: './not-found.html',
})
export class NotFound {
  private location = inject(Location);

  public volverAtras(): void {
    this.location.back();
  }
}
