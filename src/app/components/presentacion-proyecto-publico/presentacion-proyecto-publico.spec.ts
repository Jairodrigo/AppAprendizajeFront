import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentacionProyectoPublico } from './presentacion-proyecto-publico';

describe('PresentacionProyectoPublico', () => {
  let component: PresentacionProyectoPublico;
  let fixture: ComponentFixture<PresentacionProyectoPublico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionProyectoPublico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionProyectoPublico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
