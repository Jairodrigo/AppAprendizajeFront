import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEscena } from './crear-escena';

describe('CrearEscena', () => {
  let component: CrearEscena;
  let fixture: ComponentFixture<CrearEscena>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearEscena]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearEscena);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
