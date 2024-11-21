import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDivisa]'
})
export class DivisaDirective {

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;

    const start = input.selectionStart || 0;
    const cleanValue = input.value.replace(/[^0-9.-]+/g, '');
    const formattedValue = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(parseFloat(cleanValue || '0'));

    input.value = formattedValue;

    const newCursorPosition = formattedValue.length - (cleanValue.length - start);
    input.setSelectionRange(newCursorPosition, newCursorPosition);
  }

}
