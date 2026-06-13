import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-2 w-full text-left">
      @if (label()) {
        <label [for]="id()" class="block font-label-md text-label-md text-on-surface-variant ml-1 font-medium select-none">
          {{ label() }}
        </label>
      }
      <div class="relative group">
        @if (icon()) {
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
            <span class="material-symbols-outlined !text-xl">{{ icon() }}</span>
          </div>
        }
        <ng-content></ng-content>
      </div>
      @if (errors() && errors()!.length > 0 && touched()) {
        <p class="text-error text-xs mt-1 ml-1 flex flex-col gap-0.5">
          @for (error of errors(); track error) {
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined !text-[12px] font-bold">cancel</span>
              <span>{{ error.message }}</span>
            </span>
          }
        </p>
      }
    </div>
  `
})
export class FormFieldComponent {
  id = input.required<string>();
  label = input<string>('');
  icon = input<string>('');
  errors = input<any[] | null>(null);
  touched = input<boolean>(false);
}
