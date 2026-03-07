import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/service/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  standalone: true
})
export class Navbar {
  showUserMenu = false;
  showMobileMenu = false;
  searchQuery = '';

  constructor(protected authService: AuthService) {}

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  logout(): void {
    this.showUserMenu = false;
    this.showMobileMenu = false;
    this.authService.logout();
  }
}
