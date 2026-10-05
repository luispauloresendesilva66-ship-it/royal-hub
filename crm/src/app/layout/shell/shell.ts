import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Papel, rotuloPapel } from '../../core/models/pessoa.model';
import { ConversasService } from '../../core/services/conversas.service';
import { Marca } from '../../shared/ui/marca';
import { BotaoTema } from '../../shared/ui/botao-tema';
import { Icone, NomeIcone } from '../../shared/ui/icone';

interface ItemMenu { rota: string; rotulo: string; icone: NomeIcone; tecla?: string; papeis?: Papel[]; dono?: boolean; grupo: 'dia' | 'gestao' }

/** tecla: depois de apertar "g", a letra que leva para a tela */
const MENU: ItemMenu[] = [
  { rota: '/painel', rotulo: 'Painel', icone: 'painel', tecla: 'p', grupo: 'dia' },
  { rota: '/pipeline', rotulo: 'Funil', icone: 'funil', tecla: 'f', grupo: 'dia' },
  { rota: '/leads', rotulo: 'Leads', icone: 'equipe', tecla: 'l', grupo: 'dia' },
  { rota: '/conversas', rotulo: 'Conversas', icone: 'conversas', tecla: 'c', grupo: 'dia' },
  { rota: '/imoveis', rotulo: 'Imóveis', icone: 'imoveis', tecla: 'i', papeis: ['admin', 'gerente', 'corretor'], grupo: 'dia' },
  { rota: '/assistente', rotulo: 'Assistente', icone: 'assistente', tecla: 'a', grupo: 'gestao' },
  { rota: '/gerencia', rotulo: 'Agenda', icone: 'agenda', tecla: 'g', papeis: ['admin', 'gerente'], grupo: 'gestao' },
  { rota: '/sites', rotulo: 'Sites', icone: 'site', tecla: 's', papeis: ['admin'], grupo: 'gestao' },
  { rota: '/equipe', rotulo: 'Equipe', icone: 'pessoa', tecla: 'e', papeis: ['admin'], grupo: 'gestao' },
  { rota: '/ajustes', rotulo: 'Ajustes', icone: 'ajustes', tecla: 'j', papeis: ['admin'], grupo: 'gestao' },
  { rota: '/empresas', rotulo: 'Empresas', icone: 'empresa', dono: true, grupo: 'gestao' },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Marca, BotaoTema, Icone],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'atalho($event)' },
})
export class Shell {
  protected readonly auth = inject(AuthService);
  private readonly conversas = inject(ConversasService);
  private readonly conteudo = viewChild.required<ElementRef<HTMLElement>>('conteudo');

  protected readonly menuAberto = signal(false);
  protected readonly naoLidas = this.conversas.naoLidas;
  protected readonly rotuloPapel = rotuloPapel;
  private readonly router = inject(Router);
  private readonly atalhosDlg = viewChild.required<ElementRef<HTMLDialogElement>>('atalhos');
  /** momento em que a pessoa apertou "g": a próxima letra (até 1,5 s) escolhe a tela */
  private esperandoTela = 0;

  /**
   * Atalhos (como no GitHub e no Gmail): / busca, n novo lead, g + letra troca de tela, ? mostra a lista.
   * Nunca disparam enquanto a pessoa digita num campo ou com uma gaveta aberta.
   */
  protected atalho(ev: KeyboardEvent) {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const alvo = ev.target as HTMLElement | null;
    if (alvo?.closest('input, textarea, select, [contenteditable="true"], dialog[open]')) return;
    const tecla = ev.key.toLowerCase();
    if (this.esperandoTela && Date.now() - this.esperandoTela < 1500) {
      this.esperandoTela = 0;
      const item = this.itens().find((i) => i.tecla === tecla);
      if (item) { ev.preventDefault(); void this.router.navigateByUrl(item.rota); }
      return;
    }
    if (tecla === 'g') { this.esperandoTela = Date.now(); return; }
    if (ev.key === '?') { ev.preventDefault(); this.atalhosDlg().nativeElement.showModal(); return; }
    if (tecla === 'n') { ev.preventDefault(); void this.router.navigate(['/leads'], { queryParams: { novo: 1 } }); return; }
    if (ev.key !== '/') return;
    const busca = document.querySelector<HTMLInputElement>('main input[type="search"]');
    if (!busca) return;
    ev.preventDefault();
    busca.focus();
    busca.select();
  }

  protected readonly itens = computed(() => {
    const p = this.auth.perfil();
    return MENU.filter((i) => (i.dono ? p?.dono : !i.papeis || (p && i.papeis.includes(p.papel))));
  });
  protected readonly dia = computed(() => this.itens().filter((i) => i.grupo === 'dia'));
  protected readonly gestao = computed(() => this.itens().filter((i) => i.grupo === 'gestao'));

  constructor() {
    const router = this.router;
    // a cada troca de tela: fecha o menu do celular e leva o foco para o conteúdo
    // (o leitor de tela anuncia a página nova, junto com o título da aba)
    const sub = router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.menuAberto.set(false);
      queueMicrotask(() => this.conteudo().nativeElement.focus({ preventScroll: true }));
      window.scrollTo(0, 0);
    });

    // bolinha de mensagens não lidas no menu "Conversas"
    void this.conversas.contarNaoLidas();
    const parar = this.conversas.aoMudar(() => void this.conversas.contarNaoLidas());

    inject(DestroyRef).onDestroy(() => { sub.unsubscribe(); parar(); });
  }
}
