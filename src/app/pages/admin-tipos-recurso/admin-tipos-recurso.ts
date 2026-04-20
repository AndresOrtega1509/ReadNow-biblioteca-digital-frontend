import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Navbar } from '../../shared/components/navbar/navbar';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { TipoRecursoService } from '../../core/service/tipo-recurso.service';
import { TipoRecursoResponse, TipoRecursoRequest } from '../../core/models/interfaces';

@Component({
  selector: 'app-admin-tipos-recurso',
  imports: [FormsModule, Navbar, SessionTimeoutModal],
  templateUrl: './admin-tipos-recurso.html',
})
export class AdminTiposRecurso implements OnInit {
  tipos = signal<TipoRecursoResponse[]>([]);
  searchQuery = signal('');
  tiposFiltrados = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.tipos();
    if (!q) return list;
    return list.filter(t =>
      t.nombre.toLowerCase().includes(q) ||
      String(t.tipoRecursoId).includes(q)
    );
  });
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  mensaje = signal('');
  error = signal('');
  saving = signal(false);
  tipoPendienteEliminar = signal<TipoRecursoResponse | null>(null);
  eliminandoTipo = signal(false);

  form: TipoRecursoRequest = { nombre: '' };

  constructor(private tipoRecursoService: TipoRecursoService) {}

  ngOnInit(): void {
    this.cargarTipos();
  }

  cargarTipos(): void {
    this.loading.set(true);
    this.error.set('');
    this.tipoRecursoService.listar().subscribe({
      next: (data) => { this.tipos.set(data); this.loading.set(false); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje || 'Error al cargar los tipos de recurso');
      },
    });
  }

  abrirFormulario(tipo?: TipoRecursoResponse): void {
    if (tipo) {
      this.editingId.set(tipo.tipoRecursoId);
      this.form = { nombre: tipo.nombre };
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
      this.tipoRecursoService.actualizar(this.editingId()!, { nombre }).subscribe({
        next: () => {
          this.mensaje.set('Tipo de recurso actualizado correctamente');
          this.cargarTipos();
          this.showForm.set(false);
          this.saving.set(false);
          this.autoClearMensaje();
        },
        error: (err) => { this.error.set(err.error?.mensaje || 'Error al actualizar'); this.saving.set(false); },
      });
    } else {
      this.tipoRecursoService.crear({ nombre }).subscribe({
        next: () => {
          this.mensaje.set('Tipo de recurso creado correctamente');
          this.cargarTipos();
          this.showForm.set(false);
          this.saving.set(false);
          this.autoClearMensaje();
        },
        error: (err) => { this.error.set(err.error?.mensaje || 'Error al crear tipo'); this.saving.set(false); },
      });
    }
  }

  abrirConfirmacionEliminar(t: TipoRecursoResponse): void {
    this.error.set('');
    this.tipoPendienteEliminar.set(t);
  }

  cerrarModalEliminarTipo(): void {
    if (this.eliminandoTipo()) return;
    this.tipoPendienteEliminar.set(null);
    this.error.set('');
  }

  confirmarEliminarTipo(): void {
    const t = this.tipoPendienteEliminar();
    if (!t) return;
    this.eliminandoTipo.set(true);
    this.tipoRecursoService
      .eliminar(t.tipoRecursoId)
      .pipe(finalize(() => this.eliminandoTipo.set(false)))
      .subscribe({
        next: () => {
          this.tipoPendienteEliminar.set(null);
          this.error.set('');
          this.mensaje.set('Tipo de recurso eliminado correctamente');
          this.cargarTipos();
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
