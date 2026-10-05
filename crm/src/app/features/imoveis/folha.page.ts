import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Imovel } from '../../core/models/imovel.model';
import { ConfigService } from '../../core/services/config.service';
import { ImoveisService } from '../../core/services/imoveis.service';
import { BrlPipe } from '../../shared/pipes/brl.pipe';
import { formatarTelefone } from '../../shared/util/telefone';

/**
 * Folha de opções para o cliente. No lugar do PDF gerado no servidor, o próprio
 * navegador imprime ou salva em PDF (Ctrl+P → "Salvar como PDF").
 */
@Component({
  selector: 'app-folha',
  imports: [RouterLink, BrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="barra nao-imprimir">
      <a class="btn" routerLink="/imoveis">← Voltar</a>
      <label class="campo cliente">
        <span class="rotulo">Para (opcional)</span>
        <input [value]="cliente()" (input)="cliente.set($any($event.target).value)" placeholder="Nome do cliente" />
      </label>
      <button type="button" class="btn primario" (click)="imprimir()">Imprimir ou salvar PDF</button>
    </div>

    <article class="folha tema-claro">
      <header>
        <div>
          <p class="empresa">{{ auth.empresa()?.nome }}</p>
          <h1>{{ cliente() ? 'Opções separadas para ' + cliente() : 'Opções de imóveis' }}</h1>
        </div>
        <p class="contato">
          {{ config.config()?.corretor }}@if (config.config()?.creci) { · CRECI {{ config.config()?.creci }} }<br />
          {{ whats() }}
        </p>
      </header>
      @for (m of imoveis(); track m.id) {
        <section class="opcao">
          @if (m.fotos[0]) { <img [src]="m.fotos[0]" [alt]="m.tipo + ' no ' + m.bairro" /> }
          <div>
            <p class="cod mono">Cód. {{ m.codigo }}</p>
            <h2>{{ m.tipo }} · {{ m.bairro }}, {{ m.cidade }}</h2>
            <p class="preco mono">{{ m.preco ? (m.preco | brl) : 'Sob consulta' }}</p>
            <p class="specs">
              @if (m.quartos) { {{ m.quartos }} quarto(s) · } @if (m.suites) { {{ m.suites }} suíte(s) · }
              @if (m.vagas) { {{ m.vagas }} vaga(s) · } @if (m.area) { {{ m.area }} m² }
            </p>
            @if (m.condominio || m.iptu) { <p class="specs">Condomínio {{ m.condominio | brl }} · IPTU {{ m.iptu | brl }}/ano</p> }
            <p class="desc">{{ m.descricao.slice(0, 420) }}</p>
            <p class="link mono">{{ origem }}/imovel/{{ m.id }}</p>
          </div>
        </section>
      } @empty {
        <p class="mudo">Carregando…</p>
      }
    </article>
  `,
  styles: `
    .barra { display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--esp-2-5); margin-bottom: var(--esp-5); .cliente { flex: 1 1 220px; } }
    .folha { background: var(--branco); max-width: 820px; margin: 0 auto; padding: var(--esp-8) var(--esp-10); border: 1px solid var(--cor-borda); border-radius: var(--raio); }
    .folha > header { display: flex; justify-content: space-between; gap: var(--esp-5); padding-bottom: var(--esp-4); border-bottom: 2px solid var(--cor-marca); margin-bottom: var(--esp-2);
      .empresa { font: 500 var(--texto-2xs)/1 var(--mono); letter-spacing: .16em; text-transform: uppercase; color: var(--cor-marca-texto); margin-bottom: var(--esp-2); }
      h1 { font-family: var(--serif); font-weight: 600; font-size: var(--texto-3xl); letter-spacing: .01em; color: var(--cor-titulo); }
      .contato { text-align: right; font-size: var(--texto-xs); color: var(--cor-texto-3); } }
    .opcao { display: grid; grid-template-columns: 240px 1fr; gap: var(--esp-5); padding: var(--esp-5) 0; border-bottom: 1px solid var(--cor-borda); break-inside: avoid;
      img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: var(--raio-sm); }
      .cod { font-size: var(--texto-xs); color: var(--cor-texto-mudo); } h2 { font-size: var(--texto-md); margin: 2px 0 var(--esp-1); }
      .preco { font-size: var(--texto-lg); font-weight: 500; color: var(--cor-destaque); } .specs { font-size: var(--texto-xs); color: var(--cor-texto-3); }
      .desc { font-size: var(--texto-xs); margin-top: var(--esp-1-5); } .link { font-size: var(--texto-2xs); color: var(--cor-texto-mudo); margin-top: var(--esp-1-5); word-break: break-all; } }
    @media (max-width: 640px) { .opcao { grid-template-columns: 1fr; } .folha { padding: var(--esp-5); } }
    @media print {
      .folha { border: 0; padding: 0; max-width: none; }
    }
  `,
})
export default class FolhaPage {
  /** ?ids=a,b,c */
  readonly ids = input<string>('');

  protected readonly auth = inject(AuthService);
  protected readonly config = inject(ConfigService);
  private readonly srv = inject(ImoveisService);

  protected readonly imoveis = signal<Imovel[]>([]);
  protected readonly cliente = signal('');
  protected readonly origem = location.origin;
  protected readonly whats = () => formatarTelefone(this.config.config()?.whats);

  constructor() {
    void this.config.garantir().catch(() => null);
    effect(() => {
      const lista = (this.ids() ?? '').split(',').filter(Boolean);
      void this.carregar(lista);
    });
  }

  private async carregar(ids: string[]) {
    if (ids.length) this.imoveis.set(await this.srv.porIds(ids).catch(() => []));
  }

  protected imprimir() { window.print(); }
}
