import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface-light premium-card rounded-xl p-8 md:p-10 relative overflow-hidden shadow-xl w-full">
      <!-- Subtle Decorative Gradient -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-success opacity-80"></div>
      
      <header class="text-center mb-6">
        <h2 class="font-headline-md text-headline-md text-on-surface mb-2">{{ title() }}</h2>
        @if (description()) {
          <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">{{ description() }}</p>
        }
      </header>

      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .premium-card {
      box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid #E2E8F0;
    }
  `]
})
export class AuthCard {
  title = input.required<string>();
  description = input<string>('');
}
