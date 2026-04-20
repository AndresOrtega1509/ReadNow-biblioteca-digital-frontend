import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Navbar } from '../../shared/components/navbar/navbar';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { CategoriaService } from '../../core/service/categoria.service';
import { CategoriaRecursoResponse, CategoriaRecursoRequest } from '../../core/models/interfaces';

@Component({
  selector: 'app-admin-categorias',
  imports: [FormsModule, Navbar, SessionTimeoutModal],
  templateUrl: './admin-categorias.html',
})
export class AdminCategorias implements OnInit {
  categorias = signal<CategoriaRecursoResponse[]>([]);
  searchQuery = signal('');
  categoriasFiltradas = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.categorias();
    if (!q) return list;
    return list.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      String(c.categoriaRecursoId).includes(q)
    );
  });
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  mensaje = signal('');
  error = signal('');
  saving = signal(false);
  categoriaPendienteEliminar = signal<CategoriaRecursoResponse | null>(null);
  eliminandoCategoria = signal(false);

  form: CategoriaRecursoRequest = { nombre: '' };

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.loading.set(true);
    this.categoriaService.listar().subscribe({
      next: (data) => { this.categorias.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  abrirFormulario(categoria?: CategoriaRecursoResponse): void {
    if (categoria) {
      this.editingId.set(categoria.categoriaRecursoId);
      this.form = { nombre: categoria.nombre };
    } else {
      this.editingId.set(null);
      this.form = { nombre: '' };
    }
    this.error.set('');
    this.showForm.set(true);
  }

  cerrarFormulario(): void {
    this.showForm.set(false);
    this.error.set('');
  }

  guardar(): void {
    const nombre = this.form.nombre?.trim();
    if (!nombre) {
      this.error.set('El nombre es obligatorio.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    if (this.editingId()) {
      this.categoriaService.actualizar(this.editingId()!, { nombre }).subscribe({
        next: () => {
          this.mensaje.set('Categoría actualizada correctamente');
          this.cargarCategorias();
          this.showForm.set(false);
          this.saving.set(false);
          this.autoClearMensaje();
        },
        error: (err) => { this.error.set(err.error?.mensaje || 'Error al actualizar'); this.saving.set(false); },
      });
    } else {
      this.categoriaService.crear({ nombre }).subscribe({
        next: () => {
          this.mensaje.set('Categoría creada correctamente');
          this.cargarCategorias();
          this.showForm.set(false);
          this.saving.set(false);
          this.autoClearMensaje();
        },
        error: (err) => { this.error.set(err.error?.mensaje || 'Error al crear categoría'); this.saving.set(false); },
      });
    }
  }

  abrirConfirmacionEliminar(c: CategoriaRecursoResponse): void {
    this.error.set('');
    this.categoriaPendienteEliminar.set(c);
  }

  cerrarModalEliminarCategoria(): void {
    if (this.eliminandoCategoria()) return;
    this.categoriaPendienteEliminar.set(null);
    this.error.set('');
  }

  confirmarEliminarCategoria(): void {
    const c = this.categoriaPendienteEliminar();
    if (!c) return;
    this.eliminandoCategoria.set(true);
    this.categoriaService
      .eliminar(c.categoriaRecursoId)
      .pipe(finalize(() => this.eliminandoCategoria.set(false)))
      .subscribe({
        next: () => {
          this.categoriaPendienteEliminar.set(null);
          this.error.set('');
          this.mensaje.set('Categoría eliminada correctamente');
          this.cargarCategorias();
          this.autoClearMensaje();
        },
        error: (err) => {
          this.error.set(err.error?.mensaje || 'Error al eliminar');
          this.autoClearMensaje();
        },
      });
  }

  private autoClearMensaje(): void {
    setTimeout(() => { this.mensaje.set(''); this.error.set(''); }, 4000);
  }
}
