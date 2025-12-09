import { TestBed } from '@angular/core/testing';

import { Nacionalidad } from './nacionalidad';

describe('Nacionalidad', () => {
  let service: Nacionalidad;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Nacionalidad);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
