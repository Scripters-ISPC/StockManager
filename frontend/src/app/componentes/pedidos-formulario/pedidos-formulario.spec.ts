import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PedidosFormulario } from './pedidos-formulario';

describe('PedidosFormulario', () => {
  let component: PedidosFormulario;
  let fixture: ComponentFixture<PedidosFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidosFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
