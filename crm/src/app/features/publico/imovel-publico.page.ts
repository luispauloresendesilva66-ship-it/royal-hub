import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ImovelPublico, SitesService } from '../../core/services/sites.service';
import { BrlPipe } from '../../shared/pipes/brl.pipe';
import { linkWhats } from '../../shared/util/telefone';

/** /imovel/:id — a página que o cliente abre pelo link (WhatsApp, anúncio, site). */
@Component({
  selector: 'app-imovel-publico',
  imports: [BrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tema-claro' },
  template: `
    @if (m(); as m) {
      <div class="pagina">
        <header class="topo"><span class="marca">{{ m.empresa }}</span>
          @if (whats()) { <a class="botao" [href]="whats()" target="_blank" rel="noopener">Tenho interesse</a> }</header>
        <main>
          <section class="galeria" aria-label="Fotos">
            @if (m.fotos.length) {
              <img class="principal" [src]="m.fotos[foto()]" [alt]="'Foto ' + (foto() + 1) + ' de ' + m.fotos.length + ': ' + m.tipo + ' no ' + m.bairro" />
              @if (m.fotos.length > 1) {
                <ul class="miniaturas">
                  @for (f of m.fotos; track f; let i = $index) {
                    <li><button type="button" (click)="foto.set(i)" [attr.aria-pressed]="foto() === i" [attr.aria-label]="'Ver foto ' + (i + 1)">
                      <img [src]="f" alt="" loading="lazy" /></button></li>
                  }
                </ul>
              }
            } @else { <div class="sem-foto">Fotos sob pedido</div> }
          </section>

          <section class="dados">
            <p class="codigo">Cód. {{ m.codigo }} · {{ m.finalidade === 'aluguel' ? 'Aluguel' : 'Venda' }}</p>
            <h1>{{ m.tipo }} no {{ m.bairro }}</h1>
            <p class="cidade">{{ m.cidade }}</p>
            <p class="preco">{{ m.preco ? (m.preco | brl) : 'Sob consulta' }}@if (m.finalidade === 'aluguel') {<small>/mês</small>}</p>
            <dl class="specs">
              @if (m.quartos) { <div><dt>Quartos</dt><dd>{{ m.quartos }}</dd></div> }
              @if (m.suites) { <div><dt>Suítes</dt><dd>{{ m.suites }}</dd></div> }
              @if (m.banheiros) { <div><dt>Banheiros</dt><dd>{{ m.banheiros }}</dd></div> }
              @if (m.vagas) { <div><dt>Vagas</dt><dd>{{ m.vagas }}</dd></div> }
              @if (m.area) { <div><dt>Área</dt><dd>{{ m.area }} m²</dd></div> }
              @if (m.condominio) { <div><dt>Condomínio</dt><dd>{{ m.condominio | brl }}</dd></div> }
              @if (m.iptu) { <div><dt>IPTU/ano</dt><dd>{{ m.iptu | brl }}</dd></div> }
            </dl>
            @if (m.descricao) { <p class="descricao">{{ m.descricao }}</p> }
            @if (whats()) { <a class="botao grande" [href]="whats()" target="_blank" rel="noopener">Chamar no WhatsApp sobre este imóvel</a> }
            <p class="corretor">{{ m.corretor }}@if (m.creci) { · CRECI {{ m.creci }} } · {{ m.empresa }}</p>
          </section>
        </main>
      </div>
    } @else if (naoAchou()) {
      <main class="publico-vazio"><h1>Imóvel indisponível</h1><p>Ele pode ter sido vendido. Fale com a imobiliária para ver opções parecidas.</p></main>
    } @else {
      <p class="publico-vazio" role="status">Carregando…</p>
    }
  `,
  styles: `
    .pagina { background: var(--branco); min-height: 100dvh; }
    .topo { display: flex; justify-content: space-between; align-items: center; padding: 14px clamp(16px, 4vw, 48px); border-bottom: 1px solid var(--cor-borda);
      .marca { font-family: var(--serif); font-weight: 600; font-size: var(--texto-lg); letter-spacing: .04em; color: var(--cor-titulo); } }
    .botao { background: var(--cor-acao); color: var(--branco); text-decoration: none; padding: var(--esp-2-5) var(--esp-4); border-radius: var(--raio-sm); font-weight: 500;
      &.grande { display: block; text-align: center; padding: var(--esp-3-5); font-size: var(--texto-md); margin-top: var(--esp-5); background: var(--cor-whatsapp); } }
    main { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: var(--esp-8); padding: 24px clamp(16px, 4vw, 48px) 48px; max-width: 1280px; margin: 0 auto; }
    .galeria { .principal { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: var(--raio); background: var(--cor-superficie-baixa); }
      .sem-foto { aspect-ratio: 4 / 3; display: grid; place-items: center; background: var(--cor-superficie-baixa); border-radius: var(--raio); color: var(--cor-texto-mudo); } }
    .miniaturas { list-style: none; margin: var(--esp-2-5) 0 0; padding: 0; display: flex; gap: var(--esp-2); overflow-x: auto;
      button { all: unset; cursor: pointer; display: block; border-radius: var(--raio-sm); overflow: hidden; border: 2px solid transparent;
        &[aria-pressed=true] { border-color: var(--cor-destaque); } &:focus-visible { box-shadow: var(--foco); } }
      img { width: 88px; height: 66px; object-fit: cover; display: block; } }
    .dados { display: flex; flex-direction: column; gap: var(--esp-1-5);
      .codigo { font: 500 var(--texto-2xs)/1 var(--mono); color: var(--cor-marca-texto); letter-spacing: .14em; text-transform: uppercase; }
      h1 { font-family: var(--serif); font-weight: 600; font-size: var(--texto-4xl); letter-spacing: .01em; color: var(--cor-titulo); }
      .cidade { color: var(--cor-texto-mudo); }
      .preco { font: 500 var(--texto-4xl)/1.2 var(--mono); color: var(--cor-destaque); margin-top: var(--esp-1-5); small { font-size: var(--texto-sm); color: var(--cor-texto-mudo); } }
      .descricao { white-space: pre-wrap; margin-top: var(--esp-3); color: var(--cor-texto-2); }
      .corretor { font-size: var(--texto-xs); color: var(--cor-texto-mudo); margin-top: var(--esp-4); } }
    .specs { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: var(--esp-2-5); margin: var(--esp-3) 0 0;
      div { background: var(--cor-superficie-baixa); border-radius: var(--raio-sm); padding: var(--esp-2) var(--esp-2-5); }
      dt { font-size: var(--texto-2xs); color: var(--cor-texto-mudo); text-transform: uppercase; letter-spacing: .06em; } dd { margin: 0; font-weight: 600; font-size: var(--texto-md); } }
    .publico-vazio { padding: var(--esp-12) var(--esp-5); text-align: center; color: var(--cor-texto-3); }
    @media (max-width: 860px) { main { grid-template-columns: 1fr; } }
  `,
})
export default class ImovelPublicoPage {
  readonly id = input.required<string>();
  private readonly srv = inject(SitesService);
  private readonly titulo = inject(Title);

  protected readonly m = signal<ImovelPublico | null>(null);
  protected readonly naoAchou = signal(false);
  protected readonly foto = signal(0);
  protected readonly whats = computed(() => {
    const m = this.m();
    return m ? linkWhats(m.whats, `Olá! Tenho interesse no imóvel cód. ${m.codigo} (${m.tipo} no ${m.bairro}).`) : null;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      void this.srv.imovelPublico(id).then((m) => {
        this.m.set(m);
        this.naoAchou.set(!m);
        if (m) this.titulo.setTitle(`${m.tipo} no ${m.bairro} · ${m.empresa}`);
      });
    });
  }
}
