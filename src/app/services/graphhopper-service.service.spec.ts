import { TestBed } from '@angular/core/testing';

import { GraphhopperServiceService } from './graphhopper-service.service';

describe('GraphhopperServiceService', () => {
  let service: GraphhopperServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphhopperServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
