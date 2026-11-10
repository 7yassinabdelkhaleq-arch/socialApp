import { TestBed } from '@angular/core/testing';

import { SuggestedSecService } from './suggested-sec.service';

describe('SuggestedSecService', () => {
  let service: SuggestedSecService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuggestedSecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
