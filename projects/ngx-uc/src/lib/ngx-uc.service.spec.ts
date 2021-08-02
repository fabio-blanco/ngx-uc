import { TestBed } from '@angular/core/testing';

import { NgxUcService } from './ngx-uc.service';

describe('NgxUcService', () => {
  let service: NgxUcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxUcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
