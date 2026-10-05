import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

/** Cartão de métrica: rótulo, número grande e uma linha de contexto. Vira link quando tem rota. */
@Component({
  selector: 'app-metrica',
  imports: [RouterLink, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (rota()) {
      <a class="metrica" [class.destaque]="destaque()" [routerLink]="rota()" [queryParams]="params()">
        <ng-container *ngTemplateOutlet="corpo" />
      </a>
    } @else {
      <div class="metrica" [class.destaque]="destaque()"><ng-container *ngTemplateOutlet="corpo" /></div>
    }
    <ng-template #corpo>
      <span class="rotulo">{{ rotulo() }}</span>
      <span class="valor" [style.color]="cor()">{{ valor() }}</span>
      @if (detalhe()) { <span class="detalhe">{{ detalhe() }}</span> }
    </ng-template>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .metrica {
      display: flex; flex-direction: column; gap: var(--esp-1); height: 100%; padding: var(--esp-3-5) var(--esp-4);
      background: var(--cor-superficie); border: 1px solid var(--cor-borda); border-radius: var(--raio);
      box-shadow: var(--sombra-1); color: inherit; text-decoration: none;
      transition: border-color var(--dur-rapida), background var(--dur-rapida);
      /* o número principal da tela: maior, com o fio dourado da marca */
      &.destaque { border-top: 3px solid var(--cor-marca); padding-top: var(--esp-3); .valor { font-size: var(--texto-5xl); } }
    }
    /* o anel de foco precisa vencer a sombra do cartão (C1 da auditoria) */
    a.metrica:focus-visible { box-shadow: var(--foco); border-color: var(--cor-foco); }
    a.metrica:hover { border-color: var(--cor-borda-forte); background: var(--cor-superficie-hover); }
    .rotulo { font: var(--peso-medio) var(--texto-xs)/1.3 var(--sans); color: var(--cor-texto-3); }
    .valor { font: var(--peso-forte) var(--texto-4xl)/1.1 var(--sans); font-variant-numeric: tabular-nums; letter-spacing: -.02em; color: var(--cor-titulo); }
    .detalhe { font-size: var(--texto-xs); color: var(--cor-texto-mudo); }
    @media (max-width: 400px) { .metrica { padding: var(--esp-2-5) var(--esp-3); } .valor { font-size: var(--texto-2xl); } }
  `,
})
export class Metrica {
  readonly rotulo = input.required<string>();
  readonly valor = input.required<string | number>();
  readonly detalhe = input<string>('');
  readonly rota = input<string>('');
  readonly params = input<Record<string, string>>({});
  readonly destaque = input(false);
  readonly cor = input<string | null>(null);
}
