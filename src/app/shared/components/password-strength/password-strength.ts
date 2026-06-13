import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Criterion {
  label: string;
  met: boolean;
}

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3 mt-2">
      <!-- Strength Bar -->
      <div class="space-y-1">
        <div class="flex justify-between items-center text-xs">
          <span class="text-on-surface-variant font-medium select-none">Password Strength:</span>
          <span [ngClass]="strengthColorClass()" class="font-semibold select-none">{{ strengthText() }}</span>
        </div>
        <div class="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden flex gap-1">
          <div [ngClass]="barColorClass()" [style.width.%]="strengthPercent()" class="h-full transition-all duration-300 rounded-full"></div>
        </div>
      </div>

      <!-- Criteria Checklist -->
      <ul class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        @for (crit of criteria(); track crit.label) {
          <li class="flex items-center gap-1.5 transition-colors duration-200 select-none" [ngClass]="crit.met ? 'text-success' : 'text-on-surface-variant/70'">
            <span class="material-symbols-outlined !text-[14px] font-bold">
              {{ crit.met ? 'check_circle' : 'cancel' }}
            </span>
            <span>{{ crit.label }}</span>
          </li>
        }
      </ul>
    </div>
  `
})
export class PasswordStrengthComponent {
  password = input<string>('');

  criteria = computed<Criterion[]>(() => {
    const p = this.password() || '';
    return [
      { label: 'Min. 8 characters', met: p.length >= 8 },
      { label: 'Uppercase letter', met: /[A-Z]/.test(p) },
      { label: 'Lowercase letter', met: /[a-z]/.test(p) },
      { label: 'At least one number', met: /[0-9]/.test(p) },
      { label: 'Special character', met: /[^A-Za-z0-9]/.test(p) },
    ];
  });

  score = computed<number>(() => {
    return this.criteria().filter(c => c.met).length;
  });

  strengthPercent = computed<number>(() => {
    return (this.score() / 5) * 100;
  });

  strengthText = computed<string>(() => {
    const s = this.score();
    if (s === 0) return 'Very Weak';
    if (s <= 2) return 'Weak';
    if (s <= 4) return 'Medium';
    return 'Strong';
  });

  strengthColorClass = computed<string>(() => {
    const s = this.score();
    if (s === 0) return 'text-on-surface-variant/40';
    if (s <= 2) return 'text-danger';
    if (s <= 4) return 'text-warning';
    return 'text-success';
  });

  barColorClass = computed<string>(() => {
    const s = this.score();
    if (s === 0) return 'bg-border-subtle';
    if (s <= 2) return 'bg-danger';
    if (s <= 4) return 'bg-warning';
    return 'bg-success';
  });
}
