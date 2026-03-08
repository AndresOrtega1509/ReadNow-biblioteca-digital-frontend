import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccessibilityWidget } from './shared/components/accessibility-widget/accessibility-widget';
import { AccessibilityService } from './core/service/accessibility.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AccessibilityWidget],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('read-now-web');
  constructor(_a11y: AccessibilityService) {}
}
