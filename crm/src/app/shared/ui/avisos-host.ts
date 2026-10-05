import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { AvisosService } from '../../core/ui/avisos.service';

/** Mostra os avisos ("Salvo") e a pergunta de confirmação. Fica uma vez só, no app.html. */
@Component({
  selector: 'app-avisos-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="avisos" role="status" aria-live="polite">
      @for (a of avisos.avisos(); track a.id) {
        <div class="aviso-flutuante" [class.erro]="a.tipo === 'erro'">
          <span>{{ a.texto }}</span>
          <button type="button" class="btn fantasma pequeno" (click)="avisos.fechar(a.id)" aria-label="Fechar aviso">✕</button>
        </div>
      }
    </div>

    <dialog #dlg class="confirmar" aria-labelledby="confirmar-titulo" aria-describedby="confirmar-texto"
            (keydown.escape)="$event.preventDefault(); responder(false)" (cancel)="$event.preventDefault(); responder(false)" (close)="responder(false)">
      @if (avisos.pergunta(); as p) {
        <h2 id="confirmar-titulo">{{ p.titulo }}</h2>
        <p id="confirmar-texto">{{ p.texto }}</p>
        <div class="linha fim">
          <button type="button" class="btn" (click)="responder(false)" autofocus>Cancelar</button>
          <button type="button" class="btn" [class.perigo]="p.perigo" [class.primario]="!p.perigo" (click)="responder(true)">{{ p.confirmar }}</button>
        </div>
      }
    </dialog>
  `,
  styles: `
    .avisos { position: fixed; right: 16px; bottom: 16px; z-index: var(--z-aviso); display: flex; flex-direction: column; gap: var(--esp-2); max-width: min(420px, calc(100vw - 32px)); }
    .aviso-flutuante {
      display: flex; align-items: center; gap: var(--esp-2-5); padding: var(--esp-2-5) var(--esp-2) var(--esp-2-5) var(--esp-3-5); border-radius: var(--raio);
      background: var(--cor-inverso-fundo); color: var(--cor-inverso-texto); box-shadow: var(--sombra-3); font-size: var(--texto-xs);
      &.erro { background: var(--cor-erro-forte); color: var(--branco); }
      span { flex: 1; }
      .btn { color: inherit; } .btn:hover { background: color-mix(in oklch, currentColor 20%, transparent); }
    }
    .confirmar {
      border: 1px solid var(--cor-borda); border-radius: var(--raio-lg); padding: var(--esp-5); width: min(420px, calc(100vw - 32px));
      background: var(--cor-superficie); color: var(--cor-texto); box-shadow: var(--sombra-3);
      &::backdrop { background: var(--cor-veu); }
      h2 { font-size: var(--texto-md); margin-bottom: var(--esp-2); }
      p { color: var(--cor-texto-3); margin-bottom: var(--esp-5); }
      p:empty { display: none; }
    }
  `,
})
export class AvisosHost {
  protected readonly avisos = inject(AvisosService);
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    effect(() => {
      const d = this.dlg().nativeElement;
      if (this.avisos.pergunta() && !d.open) d.showModal();
      if (!this.avisos.pergunta() && d.open) d.close();
    });
  }

  protected responder(sim: boolean) {
    this.avisos.pergunta()?.responder(sim);
  }
}
