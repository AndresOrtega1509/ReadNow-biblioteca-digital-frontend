import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecursoResponse } from '../../../core/models/interfaces';
import { getTipoRecursoColor } from '../../../core/constants/tipo-recurso-colors';

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
    return getTipoRecursoColor(this.resource().tipoRecurso);
  }

  getTypeGradient(): string {
    const color = this.getTypeColor();
    return `linear-gradient(135deg, ${color}33, ${color}11)`;
  }
}
