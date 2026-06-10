import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matGroupOutline,
  matPaymentsOutline,
  matAnalyticsOutline,
  matBookOnlineOutline,
  matSettingsOutline,
  matAutoAwesomeOutline,
  matCardMembershipOutline,
  matRateReviewOutline,
  matMapOutline,
  matHotelOutline,
  matTravelExploreOutline
} from '@ng-icons/material-icons/outline';

interface KPICard {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

interface ActivityRow {
  primaryText: string;
  secondaryText: string;
  meta: string;
  status: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
  statusText: string;
}

@Component({
  selector: 'app-placeholder',
  imports: [CommonModule, NgIconComponent],
  templateUrl: './placeholder.component.html',
  styleUrl: './placeholder.component.css',
  viewProviders: [
    provideIcons({
      matGroupOutline,
      matPaymentsOutline,
      matAnalyticsOutline,
      matBookOnlineOutline,
      matSettingsOutline,
      matAutoAwesomeOutline,
      matCardMembershipOutline,
      matRateReviewOutline,
      matMapOutline,
      matHotelOutline,
      matTravelExploreOutline
    })
  ]
})
export class PlaceholderComponent {
  private router = inject(Router);

  // Compute page information based on the active path
  pageInfo = computed(() => {
    const url = this.router.url;

    if (url.includes('/users')) {
      return {
        title: 'Users Directory',
        category: 'People',
        description: 'Manage administrative roles, customers, accounts, and system permission states.',
        icon: 'matGroupOutline',
        theme: 'from-cyan-500 to-blue-600',
        kpis: [
          { label: 'Total Users', value: '18,482', delta: '+12.4%', positive: true, icon: 'matGroupOutline', iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-600' },
          { label: 'Active Admins', value: '14', delta: 'Stable', positive: true, icon: 'matSettingsOutline', iconBg: 'bg-slate-500/10', iconColor: 'text-slate-600' },
          { label: 'Monthly Signups', value: '1,429', delta: '+28.2%', positive: true, icon: 'matAutoAwesomeOutline', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' }
        ] as KPICard[],
        activities: [
          { primaryText: 'Sarah Jenkins', secondaryText: 'Promoted to Administrator role', meta: '2 hours ago', status: 'success', statusText: 'Updated' },
          { primaryText: 'Ahmed Ayman', secondaryText: 'Logged in from a new Chrome session on Windows', meta: '4 hours ago', status: 'info', statusText: 'Security' },
          { primaryText: 'Michael Chang', secondaryText: 'Account registered via enterprise invitation link', meta: '1 day ago', status: 'neutral', statusText: 'Invite' }
        ] as ActivityRow[]
      };
    }

    if (url.includes('/analytics')) {
      return {
        title: 'Analytics & Performance',
        category: 'Overview',
        description: 'Track user engagement rates, platform latency metrics, and core conversion paths.',
        icon: 'matAnalyticsOutline',
        theme: 'from-indigo-500 to-purple-600',
        kpis: [
          { label: 'Daily Active Sessions', value: '4,821', delta: '+8.3%', positive: true, icon: 'matAnalyticsOutline', iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-600' },
          { label: 'Average Platform Latency', value: '142ms', delta: '-12.5%', positive: true, icon: 'matAutoAwesomeOutline', iconBg: 'bg-violet-500/10', iconColor: 'text-violet-600' },
          { label: 'Platform Bounce Rate', value: '24.2%', delta: '+1.1%', positive: false, icon: 'matCardMembershipOutline', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600' }
        ] as KPICard[],
        activities: [
          { primaryText: 'API Response Time', secondaryText: 'Optimized database index on reservations collection', meta: '1 hour ago', status: 'success', statusText: 'Speed Up' },
          { primaryText: 'Traffic Spike', secondaryText: 'Cairo marketplace route traffic increased by 30%', meta: '6 hours ago', status: 'warning', statusText: 'High Load' },
          { primaryText: 'Integration Status', secondaryText: 'Daily synclog with Amadeus API completed', meta: '12 hours ago', status: 'info', statusText: 'Sync Complete' }
        ] as ActivityRow[]
      };
    }

    if (url.includes('/destinations')) {
      return {
        title: 'Destinations Manager',
        category: 'Content',
        description: 'Curate geographic interest hubs, local guides, city descriptions, and pricing multipliers.',
        icon: 'matMapOutline',
        theme: 'from-emerald-500 to-teal-600',
        kpis: [
          { label: 'Active Destinations', value: '148 Cities', delta: '+6.1%', positive: true, icon: 'matMapOutline', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
          { label: 'Egyptian Hubs', value: '12 Locations', delta: 'Stable', positive: true, icon: 'matTravelExploreOutline', iconBg: 'bg-teal-500/10', iconColor: 'text-teal-600' },
          { label: 'Unmapped Listings', value: '3 Pending', delta: '-40%', positive: true, icon: 'matAutoAwesomeOutline', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-600' }
        ] as KPICard[],
        activities: [
          { primaryText: 'Sharm El Sheikh', secondaryText: 'Added 14 premium beach resorts to destination hub', meta: '30 mins ago', status: 'success', statusText: 'Added' },
          { primaryText: 'Luxor Guided Tour', secondaryText: 'Updated price multiplier to 1.15x for summer season', meta: '3 hours ago', status: 'warning', statusText: 'Pricing' },
          { primaryText: 'Giza Plateau', secondaryText: 'SEO friendly description updated in Arabic and English', meta: '2 days ago', status: 'neutral', statusText: 'Content' }
        ] as ActivityRow[]
      };
    }

    if (url.includes('/hotels')) {
      return {
        title: 'Hotels Directory',
        category: 'Content',
        description: 'Integrate external supplier systems, handle custom allocations, and adjust seasonal margins.',
        icon: 'matHotelOutline',
        theme: 'from-amber-500 to-orange-600',
        kpis: [
          { label: 'Total Connected Hotels', value: '1,204', delta: '+14.2%', positive: true, icon: 'matHotelOutline', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-600' },
          { label: 'Room Allotments', value: '45,820', delta: '+8.9%', positive: true, icon: 'matCardMembershipOutline', iconBg: 'bg-orange-500/10', iconColor: 'text-orange-600' },
          { label: 'Average Daily Rate', value: 'EGP 3,450', delta: '+3.4%', positive: true, icon: 'matPaymentsOutline', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600' }
        ] as KPICard[],
        activities: [
          { primaryText: 'Hilton Pyramids Golf', secondaryText: 'Room allocation increased by 15 deluxe rooms', meta: '10 mins ago', status: 'success', statusText: 'Inventory' },
          { primaryText: 'Steigenberger Nile Palace', secondaryText: 'Supplier API updated to version 3.2', meta: '5 hours ago', status: 'info', statusText: 'API Update' },
          { primaryText: 'Rixos Premium Alamein', secondaryText: 'Summer high-season pricing structure activated', meta: '1 day ago', status: 'warning', statusText: 'High Season' }
        ] as ActivityRow[]
      };
    }

    if (url.includes('/trips')) {
      return {
        title: 'Trips & Packages',
        category: 'Content',
        description: 'Design ready-to-book itineraries, verify multi-city flights, and adjust travel packages.',
        icon: 'matTravelExploreOutline',
        theme: 'from-blue-500 to-indigo-600',
        kpis: [
          { label: 'Active Packages', value: '412', delta: '+9.4%', positive: true, icon: 'matTravelExploreOutline', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600' },
          { label: 'Avg Trip Duration', value: '6.4 Days', delta: 'Stable', positive: true, icon: 'matAutoAwesomeOutline', iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-600' },
          { label: 'Trips Generated by AI', value: '29,482', delta: '+142%', positive: true, icon: 'matAutoAwesomeOutline', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-600' }
        ] as KPICard[],
        activities: [
          { primaryText: 'Nile Cruise & Hurghada', secondaryText: 'Pre-packaged flight schedule adjusted for winter season', meta: '4 hours ago', status: 'warning', statusText: 'Schedule' },
          { primaryText: 'Egyptian Oasis Adventure', secondaryText: 'Created and deployed a new desert safari tour package', meta: '12 hours ago', status: 'success', statusText: 'New Package' },
          { primaryText: 'AI Custom Generator', secondaryText: 'Fixed itinerary timeout errors for 9-day requests', meta: '2 days ago', status: 'info', statusText: 'Bug Fix' }
        ] as ActivityRow[]
      };
    }

    if (url.includes('/bookings')) {
      return {
        title: 'Bookings & Orders',
        category: 'Operations',
        description: 'Verify processed bookings, manage flight PNR statuses, and issue reservation tickets.',
        icon: 'matBookOnlineOutline',
        theme: 'from-violet-500 to-fuchsia-600',
        kpis: [
          { label: 'Active Bookings', value: '1,294', delta: '+15.2%', positive: true, icon: 'matBookOnlineOutline', iconBg: 'bg-violet-500/10', iconColor: 'text-violet-600' },
          { label: 'Pending Confirmations', value: '18', delta: '-34.2%', positive: true, icon: 'matSettingsOutline', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-600' },
          { label: 'Gross Booking Volume', value: 'EGP 8.4M', delta: '+22.1%', positive: true, icon: 'matPaymentsOutline', iconBg: 'bg-fuchsia-500/10', iconColor: 'text-fuchsia-600' }
        ] as KPICard[],
        activities: [
          { primaryText: 'Booking #RH-9082', secondaryText: 'Hilton Pyramids booking confirmed successfully', meta: '5 mins ago', status: 'success', statusText: 'Confirmed' },
          { primaryText: 'Booking #RH-9064', secondaryText: 'Flight ticket issued (EgyptAir MS779)', meta: '1 hour ago', status: 'info', statusText: 'Ticket Issued' },
          { primaryText: 'Booking #RH-8991', secondaryText: 'Customer requested cancellation for Hurghada resort', meta: '6 hours ago', status: 'danger', statusText: 'Refund Req' }
        ] as ActivityRow[]
      };
    }

    if (url.includes('/ai-usage')) {
      return {
        title: 'AI Intelligence Center',
        category: 'Intelligence',
        description: 'Monitor AI trip recommendation rates, prompt tokens, accuracy rating, and LLM costs.',
        icon: 'matAutoAwesomeOutline',
        theme: 'from-pink-500 to-rose-600',
        kpis: [
          { label: 'Monthly AI Prompts', value: '984,281', delta: '+84.2%', positive: true, icon: 'matAutoAwesomeOutline', iconBg: 'bg-pink-500/10', iconColor: 'text-pink-600' },
          { label: 'Average Accuracy', value: '96.8%', delta: '+0.4%', positive: true, icon: 'matRateReviewOutline', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600' },
          { label: 'Cost Per 1K Prompts', value: 'EGP 3.42', delta: '-14.3%', positive: true, icon: 'matPaymentsOutline', iconBg: 'bg-teal-500/10', iconColor: 'text-teal-600' }
        ] as KPICard[],
        activities: [
          { primaryText: 'Model Switch', secondaryText: 'Upgraded primary planner engine to Gemini 1.5 Pro', meta: 'Yesterday', status: 'success', statusText: 'Upgraded' },
          { primaryText: 'Cache Hit Rate', secondaryText: 'Recommendation caching increased hit rate to 42%', meta: '2 days ago', status: 'info', statusText: 'Cached' },
          { primaryText: 'LLM Rate Limit Warning', secondaryText: 'API keys hit warning threshold during peak hours (10 PM)', meta: '3 days ago', status: 'warning', statusText: 'Quota Limit' }
        ] as ActivityRow[]
      };
    }

    if (url.includes('/subscriptions')) {
      return {
        title: 'Enterprise Subscriptions',
        category: 'Billing',
        description: 'Track corporate subscription levels, member licensing numbers, and active client trials.',
        icon: 'matCardMembershipOutline',
        theme: 'from-sky-500 to-blue-600',
        kpis: [
          { label: 'Corporate Accounts', value: '341', delta: '+8.7%', positive: true, icon: 'matCardMembershipOutline', iconBg: 'bg-sky-500/10', iconColor: 'text-sky-600' },
          { label: 'Active Licenses', value: '4,891', delta: '+12.1%', positive: true, icon: 'matGroupOutline', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600' },
          { label: 'Monthly Subscription MRR', value: 'EGP 680K', delta: '+9.3%', positive: true, icon: 'matPaymentsOutline', iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-600' }
        ] as KPICard[],
        activities: [
          { primaryText: 'Etisalat Egypt', secondaryText: 'Renewed corporate Enterprise Plan for 150 members', meta: '3 hours ago', status: 'success', statusText: 'Renewed' },
          { primaryText: 'EG Bank', secondaryText: 'Initiated 30-day Premium trial for travel management', meta: '5 hours ago', status: 'info', statusText: 'New Trial' },
          { primaryText: 'DevOps Team Inc', secondaryText: 'Subscription downgraded to Basic tier', meta: '3 days ago', status: 'neutral', statusText: 'Downgrade' }
        ] as ActivityRow[]
      };
    }

    if (url.includes('/payments')) {
      return {
        title: 'Stripe Payments',
        category: 'Billing',
        description: 'Monitor processed credit cards, instate bank transfers, issue refunds, and audit revenue.',
        icon: 'matPaymentsOutline',
        theme: 'from-emerald-500 to-green-600',
        kpis: [
          { label: 'Gross Volume Today', value: 'EGP 342.9K', delta: '+18.4%', positive: true, icon: 'matPaymentsOutline', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
          { label: 'Successful Payments', value: '14,892', delta: '+6.2%', positive: true, icon: 'matAutoAwesomeOutline', iconBg: 'bg-green-500/10', iconColor: 'text-green-600' },
          { label: 'Dispute Rate', value: '0.04%', delta: '-25.0%', positive: true, icon: 'matRateReviewOutline', iconBg: 'bg-slate-500/10', iconColor: 'text-slate-600' }
        ] as KPICard[],
        activities: [
          { primaryText: 'Dispute Resolved', secondaryText: 'Charge ID ch_98A2F settled in platform favor', meta: '1 hour ago', status: 'success', statusText: 'Resolved' },
          { primaryText: 'Refund Issued', secondaryText: 'EGP 4,200 returned to card ending in 8841', meta: '2 hours ago', status: 'neutral', statusText: 'Refunded' },
          { primaryText: 'Webhook Triggered', secondaryText: 'Processed payment.intent.succeeded from Stripe API', meta: '4 hours ago', status: 'info', statusText: 'Stripe Event' }
        ] as ActivityRow[]
      };
    }

    if (url.includes('/stripe')) {
      return {
        title: 'Stripe Integration & Reviews',
        category: 'Billing',
        description: 'Audit payout transfers, toggle webhook listeners, and review connected bank accounts.',
        icon: 'matRateReviewOutline',
        theme: 'from-violet-500 to-indigo-600',
        kpis: [
          { label: 'Connected Accounts', value: '8 Partners', delta: 'Stable', positive: true, icon: 'matGroupOutline', iconBg: 'bg-violet-500/10', iconColor: 'text-violet-600' },
          { label: 'Payouts Pending', value: 'EGP 145K', delta: '-12.4%', positive: true, icon: 'matPaymentsOutline', iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-600' },
          { label: 'Webhooks Success Rate', value: '99.98%', delta: '+0.02%', positive: true, icon: 'matAutoAwesomeOutline', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' }
        ] as KPICard[],
        activities: [
          { primaryText: 'Payout Initiated', secondaryText: 'Transfer of EGP 80,000 sent to CIB Bank Account', meta: '2 hours ago', status: 'success', statusText: 'Paid Out' },
          { primaryText: 'Webhook Event Fired', secondaryText: 'payout.created logged and validated successfully', meta: '2 hours ago', status: 'info', statusText: 'Webhook' },
          { primaryText: 'Stripe Connect API', secondaryText: 'Refreshed access token for supplier hotel portal', meta: '1 day ago', status: 'success', statusText: 'Token Reset' }
        ] as ActivityRow[]
      };
    }

    // Default Overview Dashboard
    return {
      title: 'Dashboard Overview',
      category: 'Overview',
      description: 'General system administration panel, live travel movements, and fleet analytics.',
      icon: 'matAutoAwesomeOutline',
      theme: 'from-primary to-emerald-600',
      kpis: [
        { label: 'Total active users', value: '2,847', delta: '+12.4%', positive: true, icon: 'matGroupOutline', iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-600' },
        { label: 'Pro Subscribers', value: '341', delta: '+8.7%', positive: true, icon: 'matCardMembershipOutline', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-600' },
        { label: 'Bookings This Month', value: '1,294', delta: '-2.1%', positive: false, icon: 'matBookOnlineOutline', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' }
      ] as KPICard[],
      activities: [
        { primaryText: 'System status normal', secondaryText: 'All travel API connections are active and running.', meta: 'Just now', status: 'success', statusText: 'Online' },
        { primaryText: 'EgyptAir integration synced', secondaryText: 'Domestic flight schedules successfully cached.', meta: '15 mins ago', status: 'info', statusText: 'Sync Complete' },
        { primaryText: 'Database backup', secondaryText: 'Automatic nightly cloud snapshot saved successfully.', meta: '4 hours ago', status: 'success', statusText: 'Backup Saved' }
      ] as ActivityRow[]
    };
  });
}
