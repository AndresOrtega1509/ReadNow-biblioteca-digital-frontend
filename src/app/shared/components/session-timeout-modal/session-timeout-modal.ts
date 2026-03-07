import { Component } from '@angular/core';
import { SessionService } from '../../../core/service/session.service';

@Component({
    selector: 'app-session-timeout-modal',
    imports: [],
    templateUrl: './session-timeout-modal.html',
    standalone: true
})
export class SessionTimeoutModal {
  constructor(protected sessionService: SessionService) {}

  confirm(): void {
    this.sessionService.confirmActivity();
  }
}
