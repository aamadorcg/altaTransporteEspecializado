import { TestBed } from '@angular/core/testing';

import { AltaRevistaService } from './alta-revista.service';

describe('AltaRevistaService', () => {
  let service: AltaRevistaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AltaRevistaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
