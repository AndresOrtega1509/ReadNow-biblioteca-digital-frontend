import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Navbar } from '../../shared/components/navbar/navbar';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { RecursoService } from '../../core/service/recurso.service';
import { CategoriaService } from '../../core/service/categoria.service';
import { TipoRecursoService } from '../../core/service/tipo-recurso.service';
import { RecursoResponse, RecursoRequest, CategoriaRecursoResponse, TipoRecursoResponse } from '../../core/models/interfaces';

@Component({
  selector: 'app-admin-recursos',
  imports: [FormsModule, DecimalPipe, Navbar, SessionTimeoutModal],
  templateUrl: './admin-recursos.html',
})
export class AdminRecursos implements OnInit {
  recursos = signal<RecursoResponse[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  mensaje = signal('');
  error = signal('');
  searchQuery = signal('');
  saving = signal(false);

  form: RecursoRequest = {
    nombre: '', autor: '', descripcion: '', idioma: 'Español',
    fechaPublicacion: '', tipoRecursoId: 1, categoriaRecursoId: null,
  };
  selectedFile: File | null = null;
  selectedFileName = signal('');
  selectedPortadaFile: File | null = null;
  selectedPortadaFileName = signal('');

  tipos = signal<TipoRecursoResponse[]>([]);
  categorias = signal<CategoriaRecursoResponse[]>([]);

  recursosFiltrados = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.recursos();
    if (!q) return list;
    return list.filter(r =>
      r.nombre.toLowerCase().includes(q) ||
      r.autor?.toLowerCase().includes(q) ||
      r.tipoRecurso?.toLowerCase().includes(q) ||
      r.categoriaRecurso?.toLowerCase().includes(q)
    );
  });

  constructor(
    private recursoService: RecursoService,
    private categoriaService: CategoriaService,
    private tipoRecursoService: TipoRecursoService,
  ) {}

  ngOnInit(): void {
    this.cargarRecursos();
    this.categoriaService.listar().subscribe({
      next: (data) => this.categorias.set(data),
    });
    this.tipoRecursoService.listar().subscribe({
      next: (data) => this.tipos.set(data),
    });
  }

  cargarRecursos(): void {
    this.loading.set(true);
    this.recursoService.listarRecursos().subscribe({
      next: (data) => { this.recursos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  abrirFormulario(recurso?: RecursoResponse): void {
    if (recurso) {
      this.editingId.set(recurso.recursoId);
      this.form = {
        nombre: recurso.nombre,
        autor: recurso.autor || '',
        descripcion: recurso.descripcion,
        idioma: recurso.idioma,
        fechaPublicacion: recurso.fechaPublicacion,
        tipoRecursoId: this.tipos().find(t => t.nombre === recurso.tipoRecurso)?.tipoRecursoId ?? this.tipos()[0]?.tipoRecursoId ?? 1,
        categoriaRecursoId: this.categorias().find(c => c.nombre === recurso.categoriaRecurso)?.categoriaRecursoId ?? null,
      };
    } else {
      this.editingId.set(null);
      this.form = {
        nombre: '', autor: '', descripcion: '', idioma: 'Español',
        fechaPublicacion: '', tipoRecursoId: this.tipos()[0]?.tipoRecursoId ?? 1, categoriaRecursoId: null,
      };
    }
    this.selectedFile = null;
    this.selectedFileName.set('');
    this.selectedPortadaFile = null;
    this.selectedPortadaFileName.set('');
    this.error.set('');
    this.showForm.set(true);
  }

  cerrarFormulario(): void {
    this.showForm.set(false);
    this.error.set('');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.selectedFileName.set(this.selectedFile.name);
    }
  }

  onPortadaFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedPortadaFile = input.files[0];
      this.selectedPortadaFileName.set(this.selectedPortadaFile.name);
    }
  }

  guardar(): void {
    this.saving.set(true);
    this.error.set('');

    if (this.editingId()) {
      this.recursoService.actualizarRecurso(
        this.editingId()!,
        this.form,
        this.selectedFile,
        this.selectedPortadaFile
      ).subscribe({
        next: () => {
          this.mensaje.set('Recurso actualizado exitosamente');
          this.cargarRecursos();
          this.showForm.set(false);
          this.saving.set(false);
          this.autoClearMensaje();
        },
        error: (err) => { this.error.set(err.error?.mensaje || 'Error al actualizar'); this.saving.set(false); },
      });
    } else {
      this.recursoService.crearRecurso(this.form, this.selectedFile, this.selectedPortadaFile).subscribe({
        next: () => {
          this.mensaje.set('Recurso creado exitosamente');
          this.cargarRecursos();
          this.showForm.set(false);
          this.saving.set(false);
          this.autoClearMensaje();
        },
        error: (err) => { this.error.set(err.error?.mensaje || 'Error al crear recurso'); this.saving.set(false); },
      });
    }
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar este recurso?')) {
      this.recursoService.eliminarRecurso(id).subscribe({
        next: () => {
          this.mensaje.set('Recurso eliminado exitosamente');
          this.cargarRecursos();
          this.autoClearMensaje();
        },
        error: (err) => { this.error.set(err.error?.mensaje || 'Error al eliminar'); this.autoClearMensaje(); },
      });
    }
  }

  private autoClearMensaje(): void {
    setTimeout(() => { this.mensaje.set(''); this.error.set(''); }, 4000);
  }
}
