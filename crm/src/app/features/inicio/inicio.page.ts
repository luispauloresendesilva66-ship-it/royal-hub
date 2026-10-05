import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Marca } from '../../shared/ui/marca';

/** WhatsApp comercial do Royal Hub (só dígitos, com 55 e DDD): destino do "Quero conhecer". */
const CONTATO_WHATS = '553488497914';
const ENDERECO = 'https://royalimobhub.com.br/';
const DESCRICAO = 'Royal Hub é o bot de WhatsApp e CRM para imobiliárias: a assistente responde, qualifica e marca a visita, e o funil organiza o resto.';

/** A página inicial pública: apresenta o Royal Hub e leva para uma conversa no WhatsApp. */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink, Marca],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tema-claro' },
  templateUrl: './inicio.page.html',
  styleUrl: './inicio.page.scss',
})
export default class InicioPage {
  protected readonly ano = new Date().getFullYear();
  protected readonly contato = `https://wa.me/${CONTATO_WHATS}?text=${encodeURIComponent('Olá! Quero conhecer o Royal Hub.')}`;

  protected readonly passos = [
    { titulo: 'Conecte por QR code', texto: 'Em Ajustes, escaneie o código com o celular da imobiliária, como no WhatsApp Web. Leva um minuto e não precisa instalar nada.' },
    { titulo: 'A assistente atende', texto: 'Responde na hora, com o jeito da sua imobiliária. Entende o que o cliente procura e sugere imóveis da carteira.' },
    { titulo: 'O funil organiza', texto: 'Cada conversa vira lead, com ficha e etapa. Você vê o que está quente e o que parou.', imagem: true },
    { titulo: 'A carteira vira site', texto: 'Imóveis com fotos e CEP viram páginas públicas para o cliente e o feed que alimenta os portais.' },
  ];

  protected readonly beneficios = [
    { titulo: 'Atende de madrugada, no domingo, no feriado.', texto: 'O cliente que chega às 23h recebe resposta às 23h, e a visita já fica na agenda.' },
    { titulo: 'Você assume quando quiser.', texto: 'Pausa a assistente em uma conversa e responde você mesmo. Depois ela volta sozinha.' },
    { titulo: 'A equipe inteira no mesmo número.', texto: 'Cada corretor vê os seus leads. O gerente acompanha tudo pelo painel.' },
    { titulo: 'No navegador e no celular.', texto: 'Sem instalar nada, com modo escuro e acessível por teclado e leitor de tela.' },
  ];

  constructor() {
    // Os robôs de busca rodam o app; as prévias de WhatsApp e redes sociais leem as tags fixas do index.html.
    const meta = inject(Meta);
    meta.updateTag({ name: 'description', content: DESCRICAO });
    meta.updateTag({ property: 'og:url', content: ENDERECO });
    const doc = inject(DOCUMENT);
    const canonico = doc.querySelector<HTMLLinkElement>('link[rel=canonical]') ?? doc.head.appendChild(Object.assign(doc.createElement('link'), { rel: 'canonical' }));
    canonico.href = ENDERECO;
    inject(DestroyRef).onDestroy(() => canonico.remove());
  }
}
