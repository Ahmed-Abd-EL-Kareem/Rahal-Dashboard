import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      (click)="onClick($event)"
      class="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg font-title-lg text-title-lg transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm select-none"
      [ngClass]="buttonClass()"
    >
      @if (loading()) {
        <span class="material-symbols-outlined animate-spin !text-lg">progress_activity</span>
        <span>Please wait...</span>
      } @else {
        <ng-content></ng-content>
      }
    </button>
  `
})
export class ButtonComponent {
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  type = input<'button' | 'submit'>('button');
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  
  btnClick = output<MouseEvent>();

  buttonClass() {
    switch (this.variant()) {
      case 'secondary':
        return 'bg-secondary text-white hover:brightness-110';
      case 'danger':
        return 'bg-danger text-white hover:brightness-110';
      case 'primary':
      default:
        return 'bg-primary-container text-white hover:brightness-110';
    }
  }

  onClick(event: MouseEvent) {
    if (this.type() !== 'submit') {
      this.btnClick.emit(event);
    }
  }
}
