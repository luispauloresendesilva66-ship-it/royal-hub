import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { ImovelVitrine, SiteEditavel } from '../../core/models/site.model';
import { BrlPipe } from '../../shared/pipes/brl.pipe';
import { linkWhats } from '../../shared/util/telefone';

/**
 * O site de um cliente: capa, filtros, grade de imóveis e contato.
 * Usado no site público (/s/slug) e na prévia da tela Sites.
 */
@Component({
  selector: 'app-vitrine',
  imports: [BrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vitrine" [class.escuro]="site().fundo === 'escuro'" [class.classica]="site().fonte === 'classica'" [style.--cor]="site().cor">
      <header class="topo">
        <span class="marca">{{ site().nome || 'Sua imobiliária' }}</span>
        @if (whats()) { <a class="botao" [href]="whats()" target="_blank" rel="noopener">Falar no WhatsApp</a> }
      </header>

      <section class="capa">
        <h1>{{ site().titulo || 'Encontre o imóvel certo para você' }}</h1>
        @if (site().subtitulo) { <p>{{ site().subtitulo }}</p> }
      </section>

      <main class="conteudo-vitrine">
        <form class="busca" role="search" aria-label="Filtrar imóveis" (submit)="$event.preventDefault()">
          <label>Tipo
            <select (change)="tipo.set($any($event.target).value)">
              <option value="">Todos</option>
              @for (t of tipos(); track t) { <option [value]="t">{{ t }}</option> }
            </select>
          </label>
          <label>Bairro
            <select (change)="bairro.set($any($event.target).value)">
              <option value="">Todos</option>
              @for (b of bairros(); track b) { <option [value]="b">{{ b }}</option> }
            </select>
          </label>
          <label>Até
            <select (change)="teto.set(+$any($event.target).value)">
              <option value="0">Qualquer valor</option>
              @for (v of tetos; track v) { <option [value]="v">{{ v | brl }}</option> }
            </select>
          </label>
          <span class="qtd" role="status">{{ lista().length }} imóvel(is)</span>
        </form>

        @if (lista().length) {
          <ul class="grade">
            @for (m of lista(); track m.id) {
              <li>
                <a [href]="(linkBase() || '') + '/imovel/' + m.id" [attr.target]="linkBase() ? '_blank' : null">
                  <div class="foto">
                    @if (m.foto) { <img [src]="m.foto" [alt]="m.tipo + ' no ' + m.bairro" loading="lazy" /> }
                  </div>
                  <div class="info">
                    <span class="preco">{{ m.preco ? (m.preco | brl) : 'Sob consulta' }}</span>
                    <span class="titulo">{{ m.tipo }} · {{ m.bairro }}</span>
                    <span class="specs">
                      @if (m.quartos) { {{ m.quartos }} qto · } @if (m.vagas) { {{ m.vagas }} vaga · } @if (m.area) { {{ m.area }} m² }
                    </span>
                  </div>
                </a>
              </li>
            }
          </ul>
        } @else {
          <p class="nada">Nenhum imóvel com esses filtros agora. Chame no WhatsApp que a gente procura para você.</p>
        }

        @if (site().sobre) {
          <section class="sobre" aria-labelledby="v-sobre"><h2 id="v-sobre">Sobre nós</h2><p>{{ site().sobre }}</p></section>
        }
      </main>

      <footer class="rodape-vitrine">
        <span>{{ site().nome }}@if (site().creci) { · CRECI {{ site().creci }} }</span>
        @if (site().endereco) { <span>{{ site().endereco }}</span> }
        @if (site().email) { <a [href]="'mailto:' + site().email">{{ site().email }}</a> }
      </footer>
    </div>
  `,
  styles: `
    .vitrine { --fundo-v: var(--branco); --texto-v: var(--ardosia-900); --suave-v: var(--ardosia-550); --cartao-v: var(--ardosia-50);
      background: var(--fundo-v); color: var(--texto-v); font-family: 'IBM Plex Sans', system-ui, sans-serif; min-height: 100%;
      &.escuro { --fundo-v: var(--marinho-900); --texto-v: var(--ardosia-100); --suave-v: var(--ardosia-400); --cartao-v: var(--marinho-800); }
      &.classica h1, &.classica .marca, &.classica h2 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500; } }
    .topo { display: flex; justify-content: space-between; align-items: center; gap: var(--esp-3); padding: 16px clamp(16px, 5vw, 56px);
      .marca { font-weight: 600; font-size: var(--texto-lg); } }
    .botao { background: var(--cor); color: var(--branco); padding: var(--esp-2-5) var(--esp-4); border-radius: var(--raio-sm); text-decoration: none; font-weight: 500; font-size: var(--texto-sm); }
    .capa { padding: clamp(28px, 6vw, 72px) clamp(16px, 5vw, 56px); border-bottom: 4px solid var(--cor);
      h1 { font-size: clamp(26px, 4vw, 44px); max-width: 22ch; line-height: 1.1; }
      p { margin-top: var(--esp-3); color: var(--suave-v); font-size: var(--texto-lg); max-width: 60ch; } }
    .conteudo-vitrine { padding: 24px clamp(16px, 5vw, 56px) 40px; }
    .busca { display: flex; flex-wrap: wrap; gap: var(--esp-3); align-items: flex-end; margin-bottom: var(--esp-5);
      label { display: flex; flex-direction: column; gap: var(--esp-1); font-size: var(--texto-xs); color: var(--suave-v); min-width: 150px; }
      select { min-height: 42px; padding: var(--esp-1-5) var(--esp-2-5); border-radius: var(--raio-sm); border: 1px solid var(--ardosia-300); background: var(--branco); color: var(--ardosia-900); font-size: var(--texto-sm); }
      .qtd { margin-left: auto; color: var(--suave-v); font-size: var(--texto-xs); } }
    .grade { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--esp-5); grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      a { display: block; color: inherit; text-decoration: none; background: var(--cartao-v); border-radius: var(--raio); overflow: hidden; height: 100%; }
      a:hover .titulo { text-decoration: underline; }
      a:focus-visible { outline: 3px solid var(--cor); outline-offset: 2px; }
      .foto { aspect-ratio: 4 / 3; background: var(--ardosia-300); img { width: 100%; height: 100%; object-fit: cover; display: block; } }
      .info { display: flex; flex-direction: column; gap: 3px; padding: var(--esp-3) var(--esp-3-5) var(--esp-3-5); }
      .preco { font-weight: 600; font-size: var(--texto-lg); } .titulo { font-size: var(--texto-sm); } .specs { font-size: var(--texto-xs); color: var(--suave-v); } }
    .nada { color: var(--suave-v); padding: var(--esp-6) 0; }
    .sobre { margin-top: var(--esp-10); max-width: 70ch; h2 { font-size: var(--texto-2xl); margin-bottom: var(--esp-2); } p { color: var(--suave-v); white-space: pre-wrap; } }
    .rodape-vitrine { display: flex; flex-wrap: wrap; gap: var(--esp-2) var(--esp-6); padding: 20px clamp(16px, 5vw, 56px); border-top: 1px solid color-mix(in oklch, currentColor 25%, transparent);
      font-size: var(--texto-xs); color: var(--suave-v); a { color: inherit; } }
  `,
})
export class Vitrine {
  readonly site = input.required<SiteEditavel>();
  readonly imoveis = input.required<ImovelVitrine[]>();
  /** Na prévia, os links do imóvel abrem o endereço público em outra aba. */
  readonly linkBase = input('');

  protected readonly tipo = signal('');
  protected readonly bairro = signal('');
  protected readonly teto = signal(0);
  protected readonly tetos = [200000, 300000, 400000, 600000, 800000, 1000000, 1500000];

  protected readonly tipos = computed(() => [...new Set(this.imoveis().map((m) => m.tipo))].sort());
  protected readonly bairros = computed(() => [...new Set(this.imoveis().map((m) => m.bairro).filter(Boolean))].sort());
  protected readonly lista = computed(() => this.imoveis().filter((m) =>
    (!this.tipo() || m.tipo === this.tipo()) && (!this.bairro() || m.bairro === this.bairro()) && (!this.teto() || m.preco <= this.teto())));
  protected readonly whats = computed(() => linkWhats(this.site().whats, `Olá! Vi o site da ${this.site().nome} e queria ajuda para encontrar um imóvel.`));
}
