import { Component, ChangeDetectionStrategy, input, output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Factura, Producto, PdfParserService } from '../../services/pdf-parser.service';
import { numberToQuetzalesWords } from '../../utils/number-to-words.util';

@Component({
  selector: 'app-invoice-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice-form.component.html'
})
export class InvoiceFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly pdfParserService = inject(PdfParserService);

  // Inputs/Outputs
  readonly factura = input<Factura>();
  readonly invoiceUpdated = output<Factura>();

  // Formulario Reactivo
  protected readonly invoiceForm: FormGroup;

  constructor() {
    // Inicializar estructura vacía del formulario
    this.invoiceForm = this.fb.group({
      id: [''],
      dte: ['', Validators.required],
      serie: ['', Validators.required],
      numero: ['', Validators.required],
      fecha: ['', Validators.required],
      establecimiento: ['', Validators.required],
      direccion: ['', Validators.required],
      dueno: ['', Validators.required],
      tratamientoDueno: ['del señor', Validators.required],
      solicitantes: [''],
      productos: this.fb.array([])
    });

    // Detectar cambios en la factura de entrada para poblar el formulario
    effect(() => {
      const fact = this.factura();
      if (fact) {
        this.populateForm(fact);
      }
    });

    // Escuchar cambios en el formulario y emitir la factura actualizada
    this.invoiceForm.valueChanges.subscribe(val => {
      this.emitUpdatedInvoice(val);
    });
  }

  get productos(): FormArray {
    return this.invoiceForm.get('productos') as FormArray;
  }

  private populateForm(fact: Factura): void {
    // Desactivar temporalmente la emisión de eventos para evitar bucles infinitos
    this.invoiceForm.patchValue({
      id: fact.id,
      dte: fact.dte,
      serie: fact.serie,
      numero: fact.numero,
      fecha: fact.fecha,
      establecimiento: fact.establecimiento,
      direccion: fact.direccion,
      dueno: fact.dueno,
      tratamientoDueno: fact.tratamientoDueno,
      solicitantes: fact.solicitantes
    }, { emitEvent: false });

    // Limpiar FormArray de productos
    while (this.productos.length !== 0) {
      this.productos.removeAt(0, { emitEvent: false });
    }

    // Rellenar FormArray
    fact.productos.forEach(p => {
      this.productos.push(this.fb.group({
        cantidad: [p.cantidad, [Validators.required, Validators.min(1)]],
        descripcion: [p.descripcion, Validators.required],
        precioUnitario: [p.precioUnitario, [Validators.required, Validators.min(0)]],
        genero: [p.genero || 'masculino', Validators.required]
      }), { emitEvent: false });
    });
  }

  addProductRow(): void {
    this.productos.push(this.fb.group({
      cantidad: [1, [Validators.required, Validators.min(1)]],
      descripcion: ['Nuevo Producto', Validators.required],
      precioUnitario: [0.00, [Validators.required, Validators.min(0)]],
      genero: ['masculino', Validators.required]
    }));
  }

  removeProductRow(index: number): void {
    this.productos.removeAt(index);
  }

  calculateTotal(): number {
    const prods = this.productos.value as Producto[];
    if (!prods) return 0;
    return prods.reduce((sum, p) => sum + ((p.cantidad || 0) * (p.precioUnitario || 0)), 0);
  }

  private emitUpdatedInvoice(formValue: Partial<Factura>): void {
    const id = formValue.id;
    if (!id) return;

    const prods = (formValue.productos || []) as Producto[];
    const total = prods.reduce((sum, p) => sum + ((p.cantidad || 0) * (p.precioUnitario || 0)), 0);
    const totalEnLetras = numberToQuetzalesWords(total, { uppercase: true });
    const conceptoDetallado = this.pdfParserService.generateConceptDetail(prods);

    const updatedFact: Factura = {
      id,
      dte: formValue.dte || '',
      serie: formValue.serie || '',
      numero: formValue.numero || '',
      fecha: formValue.fecha || '',
      establecimiento: formValue.establecimiento || '',
      direccion: formValue.direccion || '',
      dueno: formValue.dueno || '',
      tratamientoDueno: formValue.tratamientoDueno || 'del señor',
      solicitantes: formValue.solicitantes || '',
      productos: prods,
      total,
      totalEnLetras,
      conceptoDetallado
    };

    this.invoiceUpdated.emit(updatedFact);
  }
}
