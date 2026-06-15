import { Component, signal, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matSettingsOutline, matPersonOutline, matLogoutOutline, matMenuOutline } from '@ng-icons/material-icons/outline';

interface Crumb {
  label: string;
  route: string | null;
}

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
  viewProviders: [
    provideIcons({
      matSettingsOutline,
      matPersonOutline,
      matLogoutOutline,
      matMenuOutline
    })
  ]
})
export class TopBar {
  menuClick = output<void>();

  private router = inject(Router);
  private auth = inject(AuthService);

  dropdownOpen = signal(false);

  userName = computed(() => this.auth.currentUser()?.name ?? 'Rahal Admin');
  userEmail = computed(() => this.auth.currentUser()?.email ?? 'admin@rahal.travel');
  userInitial = computed(() => (this.auth.currentUser()?.name ?? 'R')[0].toUpperCase());
  userImage = computed(() => this.auth.currentUser()?.image ?? null);

  // Build breadcrumbs from current URL
  breadcrumbs = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => {
        const url = this.router.url;
        const segments = url.split('/').filter((s) => s && s !== 'dashboard');
        return segments.map((seg, i) => {
          let label = seg;
          if (/^[0-9a-fA-F]{24}$/.test(seg)) {
            label = 'Details';
          } else {
            label = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          }
          return {
            label,
            route: '/' + ['dashboard', ...segments.slice(0, i + 1)].join('/'),
          };
        }) as Crumb[];
      }),
    ),
    { initialValue: [] as Crumb[] },
  );

  dropdownItems = [
    {
      label: 'My Profile',
      icon: 'matPersonOutline',
      action: 'profile',
      danger: false,
    },
    {
      label: 'Settings',
      icon: 'matSettingsOutline',
      action: 'settings',
      danger: false,
    },
    {
      label: 'Logout',
      icon: 'matLogoutOutline',
      action: 'logout',
      danger: true,
    },
  ];

  handleDropdown(action: string) {
    this.dropdownOpen.set(false);
    if (action === 'logout') {
      this.auth.logout();
      this.router.navigate(['/login']);
    } else if (action === 'profile') {
      this.router.navigate(['/dashboard/profile']);
    } else if (action === 'settings') {
      this.router.navigate(['/dashboard/settings']);
    }
  }
}
