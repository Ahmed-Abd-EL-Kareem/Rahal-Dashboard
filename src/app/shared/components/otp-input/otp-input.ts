import { Component, ViewChildren, ElementRef, QueryList, output, signal, effect, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-2 justify-center items-center py-2" id="otp-container">
      @for (digit of [0, 1, 2, 3, 4, 5]; track digit) {
        <input
          #otpInput
          type="text"
          maxlength="1"
          [value]="digits()[digit]"
          (input)="onInput($event, digit)"
          (keydown)="onKeyDown($event, digit)"
          (paste)="onPaste($event)"
          class="w-12 h-14 text-center text-headline-md font-bold border border-border-subtle rounded-lg focus:border-primary-container focus:ring-2 focus:ring-primary-container outline-none transition-all"
        />
      }
    </div>
  `
})
export class OTPInputComponent implements AfterViewInit {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;
  
  digits = signal<string[]>(['', '', '', '', '', '']);
  codeChange = output<string>();

  constructor() {
    effect(() => {
      this.codeChange.emit(this.digits().join(''));
    });
  }

  ngAfterViewInit() {
    // Auto-focus the first OTP input
    setTimeout(() => {
      const first = this.otpInputs.first?.nativeElement;
      if (first) {
        first.focus();
      }
    }, 100);
  }

  onInput(event: Event, index: number) {
    const inputEl = event.target as HTMLInputElement;
    const value = inputEl.value.replace(/[^0-9]/g, '');
    
    const currentDigits = [...this.digits()];
    currentDigits[index] = value;
    this.digits.set(currentDigits);

    // Focus forward if we typed a digit
    if (value && index < 5) {
      const inputs = this.otpInputs.toArray();
      const nextInput = inputs[index + 1].nativeElement;
      nextInput.focus();
      nextInput.select();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      const currentDigits = [...this.digits()];
      
      // If current field is empty, move backward and clear previous digit
      if (!currentDigits[index] && index > 0) {
        const inputs = this.otpInputs.toArray();
        const prevInput = inputs[index - 1].nativeElement;
        currentDigits[index - 1] = '';
        this.digits.set(currentDigits);
        
        prevInput.focus();
        prevInput.select();
        event.preventDefault();
      } else {
        currentDigits[index] = '';
        this.digits.set(currentDigits);
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pastedData = clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pastedData.length === 0) return;

    const newDigits = [...this.digits()];
    for (let i = 0; i < Math.min(6, pastedData.length); i++) {
      newDigits[i] = pastedData[i];
    }
    this.digits.set(newDigits);

    // Focus appropriate input box after pasting
    const inputs = this.otpInputs.toArray();
    const focusIndex = Math.min(5, pastedData.length);
    if (inputs[focusIndex]) {
      inputs[focusIndex].nativeElement.focus();
    }
  }
}
