import { Component, signal, computed, inject, output, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  matDashboardOutline, 
  matAnalyticsOutline, 
  matGroupOutline, 
  matMapOutline, 
  matHotelOutline, 
  matTravelExploreOutline, 
  matBookOnlineOutline, 
  matAutoAwesomeOutline, 
  matCardMembershipOutline, 
  matPaymentsOutline, 
  matRateReviewOutline,
  matHelpOutline,
  matLogoutOutline,
  matMenuOutline,
  matMenuOpenOutline
} from '@ng-icons/material-icons/outline';

interface NavItem {
  label: string;
  icon: string; // Material Symbol name
  route: string;
  badge?: number;
}
interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIconComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  viewProviders: [
    provideIcons({
      matDashboardOutline,
      matAnalyticsOutline,
      matGroupOutline,
      matMapOutline,
      matHotelOutline,
      matTravelExploreOutline,
      matBookOnlineOutline,
      matAutoAwesomeOutline,
      matCardMembershipOutline,
      matPaymentsOutline,
      matRateReviewOutline,
      matHelpOutline,
      matLogoutOutline,
      matMenuOutline,
      matMenuOpenOutline
    })
  ]
})
export class Sidebar {
  collapsed = input<boolean>(false);
  collapseChange = output<boolean>();

  private router = inject(Router);
  private auth = inject(AuthService);

  // ── User info from auth service ──────────────────────────
  userName = computed(() => this.auth.currentUser()?.name ?? 'Admin');
  userEmail = computed(() => this.auth.currentUser()?.email ?? 'admin@rahal.travel');
  userInitial = computed(() => (this.auth.currentUser()?.name ?? 'A')[0].toUpperCase());

  // ── Sidebar width class ──────────────────────────────────
  sidebarClass = computed(() => (this.collapsed() ? 'w-[72px]' : 'w-[260px]'));

  toggleCollapse() {
    this.collapseChange.emit(!this.collapsed());
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // ── Navigation structure ─────────────────────────────────
  navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          label: 'Dashboard',
          route: '/dashboard',
          icon: 'matDashboardOutline',
        },
        {
          label: 'Analytics',
          route: '/dashboard/analytics',
          icon: 'matAnalyticsOutline',
        },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        {
          label: 'Users',
          route: '/dashboard/users',
          icon: 'matGroupOutline',
        },
      ],
    },
    {
      title: 'CONTENT',
      items: [
        {
          label: 'Destinations',
          route: '/dashboard/destinations',
          icon: 'matMapOutline',
        },
        {
          label: 'Hotels',
          route: '/dashboard/hotels',
          icon: 'matHotelOutline',
        },
        {
          label: 'Trips',
          route: '/dashboard/trip-templates',
          icon: 'matTravelExploreOutline',
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          label: 'Bookings',
          route: '/dashboard/bookings',
          badge: 12,
          icon: 'matBookOnlineOutline',
        },
        {
          label: 'AI Overview',
          route: '/dashboard/ai-usage',
          icon: 'matAutoAwesomeOutline',
        },
      ],
    },
    {
      title: 'BILLING',
      items: [
        {
          label: 'Subscriptions',
          route: '/dashboard/subscriptions',
          icon: 'matCardMembershipOutline',
        },
        {
          label: 'Payments',
          route: '/dashboard/payments',
          icon: 'matPaymentsOutline',
        },
        {
          label: 'Reviews',
          route: '/dashboard/stripe',
          icon: 'matRateReviewOutline',
        },
      ],
    },
  ];
}
