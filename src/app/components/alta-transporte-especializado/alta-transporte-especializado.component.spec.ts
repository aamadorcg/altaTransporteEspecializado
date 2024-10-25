import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaTransporteEspecializado } from './alta-transporte-especializado.component';

describe('AltaTransporteEspecializado', () => {
  let component: AltaTransporteEspecializado;
  let fixture: ComponentFixture<AltaTransporteEspecializado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltaTransporteEspecializado ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AltaTransporteEspecializado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
