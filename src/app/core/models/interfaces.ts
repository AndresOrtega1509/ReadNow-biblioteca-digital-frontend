export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  username: string;
  password: string;
}

export interface VerificacionCodigoRequest {
  email: string;
  codigo: string;
}

export interface RecuperarPasswordRequest {
  email: string;
}

export interface RecuperarPasswordResponse {
  exitoso: boolean;
  mensaje: string;
  telefonoEnmascarado?: string | null;
}

export interface VerificarTelefonoRecuperacionRequest {
  email: string;
  ultimos4Digitos: string;
}

export interface RestablecerPasswordRequest {
  token: string;
  nuevaPassword: string;
}

export interface RecursoRequest {
  nombre: string;
  autor: string;
  descripcion: string;
  idioma: string;
  fechaPublicacion: string;
  tipoRecursoId: number;
  categoriaRecursoId: number | null;
  urlPortada?: string;
}

export interface CalificacionRequest {
  recursoId: number;
  valor: number;
}

export interface ReseniaRequest {
  recursoId: number;
  descripcion: string;
}

export interface MensajeResponse {
  exitoso: boolean;
  mensaje: string;
}

export interface CategoriaRecursoResponse {
  categoriaRecursoId: number;
  nombre: string;
}

export interface CategoriaRecursoRequest {
  nombre: string;
}

export interface TipoRecursoResponse {
  tipoRecursoId: number;
  nombre: string;
}

export interface TipoRecursoRequest {
  nombre: string;
}

/** Respuesta de login: con 2FA solo mensaje; sin 2FA (desarrollo) token + datos de usuario */
export interface LoginResult {
  exitoso: boolean;
  mensaje?: string;
  token?: string;
  email?: string;
  rol?: string;
  nombre?: string;
  username?: string;
  usuarioId?: number;
  sesionConfig?: SesionConfig;
}

export interface SesionConfig {
  inactividadLecturaMs: number;
  inactividadCatalogoMs: number;
  countdownMs: number;
}

export interface LoginResponse {
  token: string;
  email: string;
  rol: string;
  nombre: string;
  username?: string;
  usuarioId: number;
  sesionConfig: SesionConfig;
}

export interface UsuarioResponse {
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  username: string;
  fechaRegistro: string;
  rol: string;
  inicioSuscripcion: string;
  finSuscripcion: string;
  finSuscripcionAt?: string | null;
  suscripcionActiva: boolean;
  /** Solo lectores: si puede activar la prueba gratuita de 15 días (una vez). */
  puedeActivarPruebaGratuita?: boolean;
  twoFactorActivo?: boolean | null;
  /** Plan de pago o "Prueba gratuita"; ausente si expiró o es admin sin contexto. */
  nombrePlanSuscripcion?: string | null;
  /** False si la cuenta fue desactivada (baja); no se borran datos en el servidor. */
  cuentaActiva?: boolean;
}

export interface SolicitudBajaPlataformaRequest {
  motivo?: string | null;
}

export interface ChatMensajeRequest {
  mensaje: string;
  /** Ruta actual del front (p. ej. /catalogo) para contextualizar respuestas. */
  paginaContexto?: string | null;
}

export interface ChatMensajeResponse {
  respuesta: string;
}

export interface SuscripcionPlanItem {
  codigoPlan: string;
  nombre: string;
  descripcion: string;
  precioCop: number;
  duracionMeses: number;
  stripeConfigurado: boolean;
}

export interface SuscripcionPlanesCatalogo {
  planesPago: SuscripcionPlanItem[];
  puedeActivarPruebaGratuita: boolean;
  diasPruebaGratuita: number;
  puedeGestionarEnStripe: boolean;
}

export interface StripeCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface ActualizarPerfilRequest {
  nombre: string;
  apellido: string;
  telefono: string;
  username: string;
}

export interface CambiarPasswordRequest {
  contrasenaActual: string;
  nuevaPassword: string;
  confirmarPassword: string;
}

export interface RecursoResponse {
  recursoId: number;
  nombre: string;
  autor: string;
  descripcion: string;
  idioma: string;
  urlArchivo: string;
  urlPortada?: string;
  fechaPublicacion: string;
  tipoRecurso: string;
  categoriaRecurso: string;
  calificacionPromedio: number;
  totalCalificaciones: number;
}

export interface CalificacionResponse {
  calificacionId: number;
  recursoId: number;
  usuarioId: number;
  nombreUsuario: string;
  valor: number;
}

export interface ReseniaResponse {
  reseniaId: number;
  recursoId: number;
  nombreUsuario: string;
  descripcion: string;
  fechaCreacion: string;
}

export interface FavoritoResponse {
  favoritoId: number;
  recursoId: number;
  nombreRecurso: string;
  autorRecurso: string;
  urlArchivo: string;
  urlPortada?: string;
}

export interface HistoriaLecturaResponse {
  historiaLecturaId: number;
  recursoId: number;
  nombreRecurso: string;
  autorRecurso: string;
  fechaLectura: string;
}

export interface EstadisticasResponse {
  totalUsuarios: number;
  totalRecursos: number;
  totalLecturas: number;
  totalCalificaciones: number;
  totalResenias: number;
  totalFavoritos: number;
  suscripcionesActivas: number;
  suscripcionesVencidas: number;
  suscripcionesPorPlan: SuscripcionPorPlan[];
  recursosMasLeidos: RecursoResponse[];
  recursosMejorCalificados: RecursoResponse[];
  recursosPorTipo: RecursoPorTipo[];
}

export interface SuscripcionPorPlan {
  nombrePlan: string;
  activas: number;
  vencidas: number;
}

export interface RecursoPorTipo {
  tipoRecurso: string;
  cantidad: number;
}
