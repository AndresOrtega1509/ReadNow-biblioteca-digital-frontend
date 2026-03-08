import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../../core/service/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  standalone: true
})
export class Navbar implements OnInit, OnDestroy {
  showUserMenu = false;
  showMobileMenu = false;
  showSearchBar = false;
  searchQuery = '';

  private searchInput$ = new Subject<string>();
  private sub?: Subscription;

  constructor(
    protected authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.sub = this.searchInput$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(q => {
      const value = (q ?? '').trim();
      this.router.navigate(['/catalogo'], {
        queryParams: { q: value || null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  toggleSearch(): void {
    this.showSearchBar = !this.showSearchBar;
    if (this.showSearchBar) {
      const q = this.route.snapshot.queryParamMap.get('q') ?? '';
      this.searchQuery = q;
    } else {
      this.searchQuery = '';
      this.router.navigate(['/catalogo'], { queryParams: { q: null }, queryParamsHandling: 'merge', replaceUrl: true });
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    this.searchInput$.next(value);
  }

  onSearchSubmit(): void {
    const q = this.searchQuery?.trim();
    if (q) {
      this.router.navigate(['/catalogo'], { queryParams: { q }, queryParamsHandling: 'merge' });
    }
  }

  logout(): void {
    this.showUserMenu = false;
    this.showMobileMenu = false;
    this.authService.logout();
  }
}
