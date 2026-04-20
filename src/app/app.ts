import { AfterViewInit, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccessibilityWidget } from './shared/components/accessibility-widget/accessibility-widget';
import { AccessibilityService } from './core/service/accessibility.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AccessibilityWidget],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  protected readonly title = signal('read-now-web');

  constructor(private readonly a11y: AccessibilityService) {}

  ngAfterViewInit(): void {
    this.a11y.refresh();
  }
}
