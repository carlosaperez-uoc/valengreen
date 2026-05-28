import { TestBed } from '@angular/core/testing';

import { ValenciaServiceService } from './valencia-service.service';

describe('ValenciaServiceService', () => {
  let service: ValenciaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValenciaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
