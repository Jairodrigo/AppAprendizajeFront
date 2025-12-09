import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentacionProyecto } from './presentacion-proyecto';

describe('PresentacionProyecto', () => {
  let component: PresentacionProyecto;
  let fixture: ComponentFixture<PresentacionProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionProyecto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionProyecto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
