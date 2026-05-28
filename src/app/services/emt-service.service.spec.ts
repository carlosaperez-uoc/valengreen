import { TestBed } from '@angular/core/testing';

import { EmtServiceService } from './emt-service.service';

describe('EmtServiceService', () => {
  let service: EmtServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmtServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
