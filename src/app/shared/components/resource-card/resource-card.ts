import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecursoResponse } from '../../../core/models/interfaces';

@Component({
    selector: 'app-resource-card',
    imports: [RouterLink],
    templateUrl: './resource-card.html',
    standalone: true
})
export class ResourceCard {
  resource = input.required<RecursoResponse>();

  getStars(): number[] {
    const rating = this.resource().calificacionPromedio || 0;
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  getTypeColor(): string {
    const type = this.resource().tipoRecurso?.toLowerCase() || '';
    const colors: Record<string, string> = {
      'libro': '#6c5ce7',
      'tesis': '#00b894',
      'revista': '#e17055',
      'artículo': '#0984e3',
      'manual': '#fdcb6e',
    };
    return colors[type] || '#6c5ce7';
  }

  getTypeGradient(): string {
    const color = this.getTypeColor();
    return `linear-gradient(135deg, ${color}33, ${color}11)`;
  }
}
