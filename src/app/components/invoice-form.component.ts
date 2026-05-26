import { Component, ChangeDetectionStrategy, input, output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Factura, Producto, PdfParserService } from '../services/pdf-parser.service';
import { numberToQuetzalesWords } from '../utils/number-to-words.util';

@Component({
  selector: 'app-invoice-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl h-full flex flex-col min-h-0">
      <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 shrink-0">
        <div>
          <h2 class="text-xl font-bold text-slate-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-indigo-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            Editor de Factura
          </h2>
          <p class="text-xs text-slate-400 mt-1">Modifica o completa los datos extraídos para el acuerdo.</p>
        </div>
      </div>

      <form [formGroup]="invoiceForm" class="flex-1 overflow-y-auto pr-1 space-y-6 min-h-0 select-text">
        <!-- Fila 1: Serie y Número -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-300">Serie Factura</label>
            <input 
              type="text" 
              formControlName="serie"
              class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-300">Número de Factura</label>
            <input 
              type="text" 
              formControlName="numero"
              class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
            />
          </div>
        </div>

        <!-- Fila 2: DTE (UUID) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-300">DTE / Número de Autorización (UUID)</label>
          <input 
            type="text" 
            formControlName="dte"
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
          />
        </div>

        <!-- Fila 3: Fecha de Emisión -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-300">Fecha de Emisión</label>
          <input 
            type="text" 
            formControlName="fecha"
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Ej: 12 de marzo de 2025"
          />
        </div>

        <!-- Fila 4: Establecimiento y Dirección -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-300">Nombre del Establecimiento / Negocio</label>
          <input 
            type="text" 
            formControlName="establecimiento"
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-300">Dirección del Establecimiento</label>
          <input 
            type="text" 
            formControlName="direccion"
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <!-- Fila 5: Dueño y Tratamiento de Género -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2 flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-300">Propietario / Dueño</label>
            <input 
              type="text" 
              formControlName="dueno"
              class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-300">Tratamiento Legal</label>
            <select 
              formControlName="tratamientoDueno"
              class="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
            >
              <option value="del señor">del señor</option>
              <option value="de la señora">de la señora</option>
            </select>
          </div>
        </div>

        <!-- Fila 6: Solicitantes (COCODE / Firmantes) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-300">Solicitante(s) o Miembros del COCODE</label>
          <textarea 
            formControlName="solicitantes"
            rows="3"
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-y leading-relaxed"
            placeholder="Ej: Manuel Lopez Mejía, Presidente del COCODE de Caserío Piedras Blancas"
          ></textarea>
        </div>

        <!-- Sección de Productos -->
        <div class="space-y-4 pt-4 border-t border-slate-800/80">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Productos / Conceptos</h3>
            <button 
              type="button" 
              (click)="addProductRow()"
              class="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-medium transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Añadir Producto
            </button>
          </div>

          <div class="space-y-3" formArrayName="productos">
            @for (prodGroup of productos.controls; track i; let i = $index) {
              <div [formGroupName]="i" class="p-4 bg-slate-950 border border-slate-800 rounded-2xl relative space-y-3">
                <button 
                  type="button" 
                  (click)="removeProductRow(i)"
                  class="absolute top-3 right-3 text-slate-500 hover:text-red-400 p-1.5 hover:bg-slate-900 rounded-lg transition-all"
                  title="Eliminar producto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>

                <!-- Cantidad y Descripción -->
                <div class="grid grid-cols-4 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold text-slate-400">Cant.</label>
                    <input 
                      type="number" 
                      formControlName="cantidad"
                      min="1"
                      class="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                    />
                  </div>
                  <div class="col-span-3 flex flex-col gap-1">
                    <label class="text-[10px] font-bold text-slate-400">Descripción del Bien/Servicio</label>
                    <input 
                      type="text" 
                      formControlName="descripcion"
                      class="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <!-- Precio y Género de Producto -->
                <div class="grid grid-cols-2 gap-4 pt-1">
                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold text-slate-400">P. Unitario (Q.)</label>
                    <input 
                      type="number" 
                      formControlName="precioUnitario"
                      step="0.01"
                      min="0"
                      class="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold text-slate-400">Género Gramatical</label>
                    <select 
                      formControlName="genero"
                      class="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="masculino">cada uno (masc.)</option>
                      <option value="femenino">cada una (fem.)</option>
                    </select>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Total de la Factura (Solo lectura informativo) -->
        <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950 p-4 rounded-2xl">
          <span class="text-xs text-slate-400 font-semibold">Total Calculado:</span>
          <span class="text-lg font-bold text-emerald-400 font-mono">Q.{{ calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
        </div>
      </form>
    </div>
  `
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

  private emitUpdatedInvoice(formValue: any): void {
    if (!formValue.id) return;

    const prods = (formValue.productos || []) as Producto[];
    const total = prods.reduce((sum, p) => sum + ((p.cantidad || 0) * (p.precioUnitario || 0)), 0);
    const totalEnLetras = numberToQuetzalesWords(total, { uppercase: true });
    const conceptoDetallado = this.pdfParserService.generateConceptDetail(prods);

    const updatedFact: Factura = {
      id: formValue.id,
      dte: formValue.dte,
      serie: formValue.serie,
      numero: formValue.numero,
      fecha: formValue.fecha,
      establecimiento: formValue.establecimiento,
      direccion: formValue.direccion,
      dueno: formValue.dueno,
      tratamientoDueno: formValue.tratamientoDueno,
      solicitantes: formValue.solicitantes,
      productos: prods,
      total,
      totalEnLetras,
      conceptoDetallado
    };

    this.invoiceUpdated.emit(updatedFact);
  }
}
