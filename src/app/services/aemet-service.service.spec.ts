import { TestBed } from '@angular/core/testing';

import { AemetServiceService } from './aemet-service.service';

describe('AemetServiceService', () => {
  let service: AemetServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AemetServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
