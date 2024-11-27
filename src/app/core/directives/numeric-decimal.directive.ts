import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumericDecimal]'
})
export class NumericDecimalDirective {
  constructor(private control: NgControl) { }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;

    const numericValue = inputValue.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      parts.splice(2);
    }

    const finalValue = parts.join('.');
    if (inputValue !== finalValue) {
      this.control.control?.setValue(finalValue);
    }
  }
}
