import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityService, ContrastMode } from '../../../core/service/accessibility.service';

@Component({
  selector: 'app-accessibility-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accessibility-widget.html',
  styleUrls: ['./accessibility-widget.css']
})
export class AccessibilityWidget {
  open = false;

  constructor(public a11y: AccessibilityService) {}

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      this.open = !this.open;
    }
    if (e.key === 'Escape' && this.open) {
      this.open = false;
    }
  }
}
