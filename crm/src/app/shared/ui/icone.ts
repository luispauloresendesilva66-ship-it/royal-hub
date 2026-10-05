import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import arrowSquareOut from '@phosphor-icons/core/assets/regular/arrow-square-out.svg';
import buildings from '@phosphor-icons/core/assets/regular/buildings.svg';
import calendarBlank from '@phosphor-icons/core/assets/regular/calendar-blank.svg';
import caretLeft from '@phosphor-icons/core/assets/regular/caret-left.svg';
import caretRight from '@phosphor-icons/core/assets/regular/caret-right.svg';
import chatsCircle from '@phosphor-icons/core/assets/regular/chats-circle.svg';
import checkCircle from '@phosphor-icons/core/assets/regular/check-circle.svg';
import clock from '@phosphor-icons/core/assets/regular/clock.svg';
import crown from '@phosphor-icons/core/assets/regular/crown.svg';
import funnel from '@phosphor-icons/core/assets/regular/funnel.svg';
import gearSix from '@phosphor-icons/core/assets/regular/gear-six.svg';
import globeSimple from '@phosphor-icons/core/assets/regular/globe-simple.svg';
import houseLine from '@phosphor-icons/core/assets/regular/house-line.svg';
import keyboard from '@phosphor-icons/core/assets/regular/keyboard.svg';
import linkSimple from '@phosphor-icons/core/assets/regular/link-simple.svg';
import pauseCircle from '@phosphor-icons/core/assets/regular/pause-circle.svg';
import pencilSimple from '@phosphor-icons/core/assets/regular/pencil-simple.svg';
import plus from '@phosphor-icons/core/assets/regular/plus.svg';
import qrCode from '@phosphor-icons/core/assets/regular/qr-code.svg';
import robot from '@phosphor-icons/core/assets/regular/robot.svg';
import signOut from '@phosphor-icons/core/assets/regular/sign-out.svg';
import squaresFour from '@phosphor-icons/core/assets/regular/squares-four.svg';
import tray from '@phosphor-icons/core/assets/regular/tray.svg';
import user from '@phosphor-icons/core/assets/regular/user.svg';
import userGear from '@phosphor-icons/core/assets/regular/user-gear.svg';
import users from '@phosphor-icons/core/assets/regular/users.svg';
import warningCircle from '@phosphor-icons/core/assets/regular/warning-circle.svg';
import whatsappLogo from '@phosphor-icons/core/assets/regular/whatsapp-logo.svg';
import x from '@phosphor-icons/core/assets/regular/x.svg';

/** Os ícones do app (Phosphor Regular). Para usar um novo, importe o .svg e acrescente aqui. */
const ICONES = {
  'abrir-fora': arrowSquareOut, imoveis: buildings, agenda: calendarBlank, anterior: caretLeft, proximo: caretRight,
  conversas: chatsCircle, ok: checkCircle, relogio: clock, coroa: crown, funil: funnel, ajustes: gearSix, site: globeSimple,
  casa: houseLine, teclado: keyboard, link: linkSimple, pausa: pauseCircle, editar: pencilSimple, mais: plus, qr: qrCode,
  assistente: robot, sair: signOut, painel: squaresFour, vazio: tray, pessoa: user, empresa: userGear, equipe: users,
  alerta: warningCircle, whatsapp: whatsappLogo, fechar: x,
} as const;
export type NomeIcone = keyof typeof ICONES;

/** Os SVGs viram máscara CSS: a cor segue o texto (currentColor) e nada passa por innerHTML. */
const URLS = Object.fromEntries(
  Object.entries(ICONES).map(([nome, svg]) => [nome, `url("data:image/svg+xml,${encodeURIComponent(svg)}")`]),
) as Record<NomeIcone, string>;

/** Ícone decorativo. Quando o ícone é o único conteúdo de um botão, dê aria-label ao botão. */
@Component({
  selector: 'app-icone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[style.--icone]': 'url()', '[style.--tam.px]': 'tamanho()' },
  template: '',
  styles: `
    :host { display: inline-block; flex: none; width: var(--tam, 16px); height: var(--tam, 16px); background: currentColor;
      mask: var(--icone) center / contain no-repeat; -webkit-mask: var(--icone) center / contain no-repeat; }
  `,
})
export class Icone {
  readonly nome = input.required<NomeIcone>();
  readonly tamanho = input(16);
  protected readonly url = computed(() => URLS[this.nome()]);
}
