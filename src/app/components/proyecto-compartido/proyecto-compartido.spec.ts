import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyectoCompartido } from './proyecto-compartido';

describe('ProyectoCompartido', () => {
  let component: ProyectoCompartido;
  let fixture: ComponentFixture<ProyectoCompartido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProyectoCompartido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProyectoCompartido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
