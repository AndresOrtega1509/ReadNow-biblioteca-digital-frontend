/** Colores por tipo de recurso. Usado en estadísticas, catálogo y tarjetas. */
export const TIPO_RECURSO_COLORS: Record<string, string> = {
  libro: '#e21143',
  tesis: '#e17055',
  revista: '#6c5ce7',
  artículo: '#00b894',
  articulo: '#00b894',
  manual: '#ff4757',
};

/** Color para Top 10 Mejor Calificados. */
export const COLOR_SECCION_TOP_10 = '#ffd32a';

/** Color para Todos los Recursos. */
export const COLOR_SECCION_TODOS_RECURSOS = '#0984e3';

/** Color único para todas las secciones por categoría. */
export const COLOR_SECCION_CATEGORIA = '#00cec9';

const FALLBACK = '#6c5ce7';

export function getTipoRecursoColor(tipoRecurso: string | null | undefined): string {
  if (!tipoRecurso) return FALLBACK;
  const key = tipoRecurso.toLowerCase().trim();
  return TIPO_RECURSO_COLORS[key] ?? FALLBACK;
}
