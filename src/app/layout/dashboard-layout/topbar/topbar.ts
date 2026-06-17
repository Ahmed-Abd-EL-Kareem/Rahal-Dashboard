<<<<<<< HEAD
import {
  Component,
  signal,
  computed,
  inject,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
=======
import { Component, signal, computed, inject, input, output } from '@angular/core';
>>>>>>> 8457a8f (Initial commit)
import { Router, RouterLink, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
<<<<<<< HEAD
import {
  matSettingsOutline,
  matPersonOutline,
  matLogoutOutline,
  matMenuOutline,
} from '@ng-icons/material-icons/outline';

import { TripService } from '../../../core/services/trip.service';
=======
import { matSettingsOutline, matPersonOutline, matLogoutOutline, matMenuOutline } from '@ng-icons/material-icons/outline';
>>>>>>> 8457a8f (Initial commit)

interface Crumb {
  label: string;
  route: string | null;
}

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
<<<<<<< HEAD
  changeDetection: ChangeDetectionStrategy.Eager,
=======
>>>>>>> 8457a8f (Initial commit)
  viewProviders: [
    provideIcons({
      matSettingsOutline,
      matPersonOutline,
      matLogoutOutline,
<<<<<<< HEAD
      matMenuOutline,
    }),
  ],
=======
      matMenuOutline
    })
  ]
>>>>>>> 8457a8f (Initial commit)
})
export class TopBar {
  menuClick = output<void>();

  private router = inject(Router);
  private auth = inject(AuthService);
<<<<<<< HEAD
  private tripService = inject(TripService, { optional: true });
=======
>>>>>>> 8457a8f (Initial commit)

  dropdownOpen = signal(false);

  userName = computed(() => this.auth.currentUser()?.name ?? 'Rahal Admin');
  userEmail = computed(() => this.auth.currentUser()?.email ?? 'admin@rahal.travel');
  userInitial = computed(() => (this.auth.currentUser()?.name ?? 'R')[0].toUpperCase());
  userImage = computed(() => this.auth.currentUser()?.image ?? null);

  // Build breadcrumbs from current URL
<<<<<<< HEAD
  currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: '' }
  );

  breadcrumbs = computed(() => {
    const url = this.currentUrl() || this.router.url;
    const segments = url.split('/').filter((s) => s && s !== 'dashboard');
    return segments.map((seg, i) => {
      let label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');

      if (this.tripService) {
        const cachedTrip = this.tripService.detailsSignal()[seg]
          || this.tripService.templatesSignal().find(t => t._id === seg);
        if (cachedTrip) {
          label = cachedTrip.title;
        }
      }

      return {
        label,
        route: '/' + ['dashboard', ...segments.slice(0, i + 1)].join('/'),
      };
    }) as Crumb[];
  });

=======
  breadcrumbs = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => {
        const url = this.router.url;
        const segments = url.split('/').filter((s) => s && s !== 'dashboard');
        return segments.map((seg, i) => ({
          label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
          route: '/' + ['dashboard', ...segments.slice(0, i + 1)].join('/'),
        })) as Crumb[];
      }),
    ),
    { initialValue: [] as Crumb[] },
  );

>>>>>>> 8457a8f (Initial commit)
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
