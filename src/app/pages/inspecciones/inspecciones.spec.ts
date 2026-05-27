import { TestBed } from '@angular/core/testing';
import { InspeccionesComponent } from './inspecciones';

describe('InspeccionesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspeccionesComponent]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(InspeccionesComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have initial mock inspections list', () => {
    const fixture = TestBed.createComponent(InspeccionesComponent);
    const component = fixture.componentInstance;
    expect(component.inspecciones().length).toBeGreaterThan(0);
  });
});
