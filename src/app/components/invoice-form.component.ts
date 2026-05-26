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
    <div class="w-full flex flex-col gap-4 text-xs select-text">
      <form [formGroup]="invoiceForm" class="space-y-4">
        
        <!-- Grupo 1: Datos de Factura (Amber) -->
        <div class="border-l-3 border-amber-500/80 bg-amber-500/5 p-3 rounded-r-2xl space-y-3">
          <div class="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
            <span>📄</span> Datos de Factura
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="font-semibold text-slate-300">Serie</label>
              <input 
                type="text" 
                formControlName="serie"
                class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-mono"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="font-semibold text-slate-300">Número</label>
              <input 
                type="text" 
                formControlName="numero"
                class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-semibold text-slate-300">DTE / UUID (Número Autorización)</label>
            <input 
              type="text" 
              formControlName="dte"
              class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-mono"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-semibold text-slate-300">Fecha de Emisión</label>
            <input 
              type="text" 
              formControlName="fecha"
              class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
              placeholder="Ej: 12 de marzo de 2025"
            />
          </div>
        </div>

        <!-- Grupo 2: Establecimiento y Propietario (Cyan) -->
        <div class="border-l-3 border-cyan-500/80 bg-cyan-500/5 p-3 rounded-r-2xl space-y-3">
          <div class="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
            <span>🏢</span> Datos del Negocio y Propietario
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-semibold text-slate-300">Nombre del Establecimiento</label>
            <input 
              type="text" 
              formControlName="establecimiento"
              class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-semibold text-slate-300">Dirección</label>
            <input 
              type="text" 
              formControlName="direccion"
              class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            />
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div class="col-span-2 flex flex-col gap-1">
              <label class="font-semibold text-slate-300">Propietario / Dueño</label>
              <input 
                type="text" 
                formControlName="dueno"
                class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="font-semibold text-slate-300">Tratamiento</label>
              <select 
                formControlName="tratamientoDueno"
                class="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-cyan-500 outline-none transition-all cursor-pointer"
              >
                <option value="del señor">del señor</option>
                <option value="de la señora">de la señora</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Grupo 3: Solicitantes / COCODE (Emerald) -->
        <div class="border-l-3 border-emerald-500/80 bg-emerald-500/5 p-3 rounded-r-2xl space-y-3">
          <div class="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
            <span>👥</span> Solicitantes
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-semibold text-slate-300">Miembros del COCODE / Solicitantes</label>
            <textarea 
              formControlName="solicitantes"
              rows="2"
              class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-y leading-relaxed"
              placeholder="Ej: Manuel Lopez Mejía, Presidente del COCODE de Caserío Piedras Blancas"
            ></textarea>
          </div>
        </div>

        <!-- Grupo 4: Productos / Conceptos (Purple) -->
        <div class="border-l-3 border-purple-500/80 bg-purple-500/5 p-3 rounded-r-2xl space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-purple-400 font-bold uppercase tracking-wider text-[10px]">
              <span>🛍️</span> Detalle de Productos
            </div>
            <button 
              type="button" 
              (click)="addProductRow()"
              class="flex items-center gap-1 px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg text-[10px] font-semibold transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              + Producto
            </button>
          </div>

          <div class="space-y-2" formArrayName="productos">
            @for (prodGroup of productos.controls; track i; let i = $index) {
              <div [formGroupName]="i" class="p-3 bg-slate-950 border border-slate-900 rounded-xl relative space-y-2">
                <button 
                  type="button" 
                  (click)="removeProductRow(i)"
                  class="absolute top-2 right-2 text-slate-500 hover:text-red-400 p-1 hover:bg-slate-900 rounded transition-all"
                  title="Eliminar producto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m6 18 18-12M6 6l12 12" />
                  </svg>
                </button>

                <!-- Cantidad y Descripción -->
                <div class="grid grid-cols-5 gap-2">
                  <div class="flex flex-col gap-1 col-span-1">
                    <label class="text-[9px] font-bold text-slate-500">Cant.</label>
                    <input 
                      type="number" 
                      formControlName="cantidad"
                      min="1"
                      class="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-purple-500 outline-none font-mono"
                    />
                  </div>
                  <div class="col-span-4 flex flex-col gap-1">
                    <label class="text-[9px] font-bold text-slate-500">Descripción del Bien/Servicio</label>
                    <input 
                      type="text" 
                      formControlName="descripcion"
                      class="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                <!-- Precio y Género de Producto -->
                <div class="grid grid-cols-2 gap-2 pt-1">
                  <div class="flex flex-col gap-1">
                    <label class="text-[9px] font-bold text-slate-500">P. Unitario (Q.)</label>
                    <input 
                      type="number" 
                      formControlName="precioUnitario"
                      step="0.01"
                      min="0"
                      class="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-purple-500 outline-none font-mono"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[9px] font-bold text-slate-500">Género Gramatical</label>
                    <select 
                      formControlName="genero"
                      class="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-purple-500 outline-none cursor-pointer"
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

        <!-- Total de la Factura -->
        <div class="bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-indigo-500/10 p-3 rounded-2xl flex items-center justify-between">
          <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total de esta Factura:</span>
          <span class="text-base font-extrabold text-indigo-400 font-mono">Q.{{ calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
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
