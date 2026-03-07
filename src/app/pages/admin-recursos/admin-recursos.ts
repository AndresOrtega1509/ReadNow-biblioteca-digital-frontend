import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Navbar } from '../../shared/components/navbar/navbar';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { RecursoService } from '../../core/service/recurso.service';
import { RecursoResponse, RecursoRequest } from '../../core/models/interfaces';

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
    fechaPublicacion: '', tipoRecursoId: 1, categoriaRecursoId: null, urlPortada: '',
  };
  selectedFile: File | null = null;
  selectedFileName = signal('');

  tipos = [
    { id: 1, nombre: 'Libro' }, { id: 2, nombre: 'Tesis' }, { id: 3, nombre: 'Revista' },
    { id: 4, nombre: 'Artículo' }, { id: 5, nombre: 'Manual' },
  ];

  categorias = [
    { id: 1, nombre: 'Ciencia Ficción' }, { id: 2, nombre: 'Historia' }, { id: 3, nombre: 'Tecnología' },
    { id: 4, nombre: 'Matemáticas' }, { id: 5, nombre: 'Literatura' }, { id: 6, nombre: 'Filosofía' },
    { id: 7, nombre: 'Medicina' }, { id: 8, nombre: 'Derecho' }, { id: 9, nombre: 'Ingeniería' },
    { id: 10, nombre: 'Arte' },
  ];

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

  constructor(private recursoService: RecursoService) {}

  ngOnInit(): void {
    this.cargarRecursos();
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
        tipoRecursoId: this.tipos.find(t => t.nombre === recurso.tipoRecurso)?.id || 1,
        categoriaRecursoId: this.categorias.find(c => c.nombre === recurso.categoriaRecurso)?.id || null,
        urlPortada: recurso.urlPortada || '',
      };
    } else {
      this.editingId.set(null);
      this.form = {
        nombre: '', autor: '', descripcion: '', idioma: 'Español',
        fechaPublicacion: '', tipoRecursoId: 1, categoriaRecursoId: null, urlPortada: '',
      };
    }
    this.selectedFile = null;
    this.selectedFileName.set('');
    this.error.set('');
    this.showForm.set(true);
  }

  cerrarFormulario(): void {
    this.showForm.set(false);
    this.error.set('');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName.set(this.selectedFile.name);
    }
  }

  guardar(): void {
    this.saving.set(true);
    this.error.set('');

    if (this.editingId()) {
      this.recursoService.actualizarRecurso(this.editingId()!, this.form).subscribe({
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
      this.recursoService.crearRecurso(this.form, this.selectedFile).subscribe({
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
