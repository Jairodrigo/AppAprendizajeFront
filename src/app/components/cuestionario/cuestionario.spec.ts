import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cuestionario } from './cuestionario';

describe('Cuestionario', () => {
  let component: Cuestionario;
  let fixture: ComponentFixture<Cuestionario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cuestionario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cuestionario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
