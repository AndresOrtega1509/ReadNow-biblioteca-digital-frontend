import { Injectable, signal } from '@angular/core';

export type ContrastMode = 'normal' | 'dark' | 'light' | 'high' | 'mono';

const STORAGE = {
  CONTRAST:        'a11y-contrast',
  FONT_STEP:       'a11y-font-step',
  SATURATION:      'a11y-saturation',
  DYSLEXIA:        'a11y-dyslexia',
  HIGHLIGHT_LINKS: 'a11y-highlight-links',
};

@Injectable({ providedIn: 'root' })
export class AccessibilityService {

  readonly contrastMode   = signal<ContrastMode>('normal');
  readonly fontStep       = signal<number>(0);         // -2 a +6 (pasos de 5%)
  readonly saturation     = signal<'normal' | 'high' | 'low'>('normal');
  readonly dyslexiaMode   = signal(false);
  readonly highlightLinks = signal(false);

  constructor() {
    this.load();
    this.applyAll();
  }

  /**
   * Vuelve a aplicar estilos cuando ya existe el DOM (p. ej. {@code #a11y-filter-root}).
   * El constructor puede correr antes del primer render de Angular.
   */
  refresh(): void {
    this.applyAll();
  }

  // ---- carga desde localStorage ----
  private load(): void {
    const c = localStorage.getItem(STORAGE.CONTRAST) as ContrastMode | null;
    if (c) this.contrastMode.set(c);

    const fs = parseInt(localStorage.getItem(STORAGE.FONT_STEP) ?? '0', 10);
    if (!isNaN(fs)) this.fontStep.set(Math.max(-2, Math.min(6, fs)));

    const sat = localStorage.getItem(STORAGE.SATURATION) as 'normal' | 'high' | 'low' | null;
    if (sat) this.saturation.set(sat);

    this.dyslexiaMode.set(localStorage.getItem(STORAGE.DYSLEXIA) === '1');
    this.highlightLinks.set(localStorage.getItem(STORAGE.HIGHLIGHT_LINKS) === '1');
  }

  // ---- Contraste ----
  setContrastMode(mode: ContrastMode): void {
    this.contrastMode.set(mode);
    localStorage.setItem(STORAGE.CONTRAST, mode);
    this.applyAll();
  }

  // ---- Tamaño texto ----
  incrementFont(): void {
    const next = Math.min(this.fontStep() + 1, 6);
    this.fontStep.set(next);
    localStorage.setItem(STORAGE.FONT_STEP, String(next));
    this.applyAll();
  }

  decrementFont(): void {
    const next = Math.max(this.fontStep() - 1, -2);
    this.fontStep.set(next);
    localStorage.setItem(STORAGE.FONT_STEP, String(next));
    this.applyAll();
  }

  get fontPercent(): string {
    const step = this.fontStep();
    if (step === 0) return 'Normal';
    return step > 0 ? `+${step * 5}%` : `${step * 5}%`;
  }

  // ---- Saturación ----
  setSaturation(mode: 'normal' | 'high' | 'low'): void {
    this.saturation.set(mode);
    localStorage.setItem(STORAGE.SATURATION, mode);
    this.applyAll();
  }

  // ---- Modos especiales ----
  toggleDyslexia(): void {
    const v = !this.dyslexiaMode();
    this.dyslexiaMode.set(v);
    localStorage.setItem(STORAGE.DYSLEXIA, v ? '1' : '0');
    this.applyAll();
  }

  toggleHighlightLinks(): void {
    const v = !this.highlightLinks();
    this.highlightLinks.set(v);
    localStorage.setItem(STORAGE.HIGHLIGHT_LINKS, v ? '1' : '0');
    this.applyAll();
  }

  // ---- Reset ----
  resetAll(): void {
    Object.values(STORAGE).forEach(k => localStorage.removeItem(k));
    this.contrastMode.set('normal');
    this.fontStep.set(0);
    this.saturation.set('normal');
    this.dyslexiaMode.set(false);
    this.highlightLinks.set(false);
    this.applyAll();
  }

  // ---- URL del PDF ----
  getPdfUrlHash(): string {
    return '#toolbar=0';
  }

  /** Filtro CSS para el iframe del PDF */
  get pdfFilter(): string {
    const filters: string[] = [];
    switch (this.contrastMode()) {
      case 'dark':  filters.push('brightness(0.88) contrast(1.1)'); break;
      case 'light': filters.push('brightness(1.15) invert(1) hue-rotate(180deg)'); break;
      case 'high':  filters.push('contrast(1.4) brightness(0.95)'); break;
      case 'mono':  filters.push('grayscale(1) contrast(1.2)'); break;
    }
    switch (this.saturation()) {
      case 'high': filters.push('saturate(2)'); break;
      case 'low':  filters.push('saturate(0.3)'); break;
    }
    return filters.length ? filters.join(' ') : 'none';
  }

  private applyAll(): void {
    const html = document.documentElement;
    const body = document.body;

    // Font size sobre <html> para que rem escale correctamente
    html.style.fontSize = `${100 + this.fontStep() * 5}%`;

    // Clases de contraste en body (variables CSS, sin filter)
    body.classList.remove(
      'a11y-contrast-normal', 'a11y-contrast-dark',
      'a11y-contrast-light',  'a11y-contrast-high', 'a11y-contrast-mono'
    );
    body.classList.add(`a11y-contrast-${this.contrastMode()}`);

    // Modos de lectura
    body.classList.toggle('a11y-dyslexia', this.dyslexiaMode());
    body.classList.toggle('a11y-links',    this.highlightLinks());

    // FILTROS CSS: se aplican al wrapper #a11y-filter-root para no romper
    // los position:fixed del widget (body con filter crea un nuevo stacking context)
    const filterRoot = document.getElementById('a11y-filter-root');
    if (filterRoot) {
      const filters: string[] = [];
      if (this.contrastMode() === 'mono') filters.push('grayscale(1)');
      switch (this.saturation()) {
        case 'high': filters.push('saturate(1.8)'); break;
        case 'low':  filters.push('saturate(0.4)'); break;
      }
      filterRoot.style.filter = filters.join(' ');
    }
  }
}
