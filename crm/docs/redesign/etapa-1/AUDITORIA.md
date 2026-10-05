# Etapa 1 — Auditoria visual e de UX (Royal Hub)

Data: 2026-10-05 · Base: `npm run demo` (dados de exemplo) · Skills: redesign-existing-projects + interface-design.
Screenshots em [antes/](antes/) (`<tela>-1440.png`, `<tela>-375.png`, mais `*-escuro.png`). Varredura axe-core (WCAG 2 A/AA + boas práticas) em [antes/axe.json](antes/axe.json): **0 violações automáticas** em todas as telas. Os problemas de acessibilidade abaixo foram achados à mão (foco, contraste de dados, alvos).

## Diagnóstico geral

A base é sólida: tokens de cor já existem com tema claro/escuro, HTML semântico, `aria-*` cuidadosos, link "pular para o conteúdo", `prefers-reduced-motion`, tabelas com `aria-sort`, gavetas em `<dialog>`. O problema não é falta de cuidado, e sim **falta de sistema** (tamanhos, espaçamento e cores soltos) e **layouts de desktop espremidos no celular**.

"Cara de IA genérica": média. A combinação navy + dourado + Cinzel em versalete + rótulos mono em caixa alta com tracking largo é um clichê de "luxo" que se repete em todas as telas: seis KPIs idênticos (ícone-número-rótulo), três colunas iguais na home, sobretítulo com traço dourado em toda seção, FAQ em acordeão.

## Crítico

| # | Problema | Onde | Evidência |
|---|---|---|---|
| C1 | **Foco invisível nos cartões de KPI**: o `box-shadow` do componente sobrescreve o anel global de `:focus-visible`. Quem navega por teclado não sabe onde está. | painel | `metrica.ts:29`; teste com Tab: shadow do cartão no lugar do anel |
| C2 | **Tabela de Leads estoura em 1440px**: 9 colunas, a última ("Entrou") fica cortada; linhas com alturas desiguais (origem + campanha quebram em 3–4 linhas). | leads | `leads-1440.png` |
| C3 | **Leads no celular é a tabela de desktop com rolagem lateral**: só nome e telefone visíveis, sem temperatura, etapa nem ação. Inutilizável em campo. | leads | `leads-375.png` |
| C4 | **`select` parece desabilitado**: a regra `&:read-only` de `styles.scss` pega todo `<select>` (o navegador considera select read-only), pintando-o de cinza. Afeta todos os filtros e formulários. | global | `styles.scss` bloco de inputs; filtros em todas as telas |
| C5 | **Cores de etapa não se adaptam ao tema escuro**: "Proposta" (#1E3A5F) some sobre o trilho escuro; idem bordas das colunas do funil. | painel, pipeline | `painel-1440-escuro.png` |

## Alto

| # | Problema | Onde |
|---|---|---|
| A1 | **23 tamanhos de fonte distintos** (9 · 10 · 10.5 · 11 · 11.5 · 12 · 12.5 · 13 · 13.5 · 14 · 14.5 · 15 · 16 · 17 · 18 · 20 · 22 · 24 · 25 · 26 · 27 · 28 · 34 px). Sem escala modular; hierarquia feita com tamanho "no olho". | global |
| A2 | **Funil (kanban) não cabe em 1440**: a 6ª coluna ("Fechado") fica cortada e o avatar do cartão é decepado; "Perdido" só aparece rolando de lado sem indicação. | pipeline |
| A3 | **Funil no celular**: colunas a 82vw com scroll-snap, mas sem indicador de qual etapa/quantas existem; a 2ª coluna aparece cortada à direita. Cabeçalho + filtros ocupam ~420px antes do primeiro cartão. | pipeline 375 |
| A4 | **Gráfico de 14 dias quebra no celular**: rótulos de data truncados ("3/0", "5/0", "1/1"), parecem datas erradas. | painel 375 |
| A5 | **Conversas no celular**: a thread não é tela cheia; cabeçalho da página + cabeçalho da conversa + barra de estado empurram a primeira mensagem para ~470px. Três botões de ação quebram em duas linhas. | conversas 375 |
| A6 | **Bot vs. humano pouco distinguível**: balões da assistente e do corretor ficam do mesmo lado, com cores próximas (azul-100 vs. verde-100); o estado "Assistente ativa / pausada até…" é só uma etiqueta pequena. | conversas |
| A7 | **Ajustes é uma parede de 4 cartões**: WhatsApp (a ação mais importante da conta) divide espaço com CRECI e webhooks. No demo aparece "Ligado" com Phone Number ID vazio (estado inconsistente). Não há fluxo guiado Conectar → QR → conectado. | ajustes |
| A8 | **Estados de loading são texto solto** ("Carregando os números…", "Buscando leads…"). Sem esqueleto, a tela pula quando os dados chegam. | todas |
| A9 | **Menu do celular é um botão "Menu" que empurra a página**: sem navegação inferior, sem atalho para Conversas/Leads na zona do polegar. | shell 375 |
| A10 | **Fontes por `<link>` do Google Fonts, bloqueando renderização**, com três famílias (Cinzel, Plex Sans, Plex Mono). Sem `preload`, sem fallback métrico. `index.html` sem `meta description` nem OG. | index.html / home |

## Médio

| # | Problema | Onde |
|---|---|---|
| M1 | **KPIs todos iguais**: 6 cartões do mesmo tamanho, número e rótulo, sem ponto focal (só "Leads no mês" tem a borda dourada). Falta comparação (vs. mês anterior) e tendência. | painel |
| M2 | **Rótulos em mono + caixa alta + tracking .18em** em KPIs, cabeçalhos de tabela, autores de mensagem e sobretítulos: cansam a leitura e carregam a "cara de template". | global |
| M3 | **Títulos de página em Cinzel versalete** competem com o conteúdo; em 375 o h1 ainda ocupa bastante. | global |
| M4 | **Cartão de imóvel**: três ações por cartão (Editar / Ver página / Copiar link) em todas as linhas = ruído; checkbox de "folha" sem rótulo visível; preço em mono pesado. Ilustração placeholder em cores aleatórias (sem foto real). | imóveis |
| M5 | **Formulários em gaveta**: valor estimado usa placeholder com cara de valor real ("850.000" em cinza). Código/Tipo/Finalidade em 3 colunas, Área sozinha numa linha: grade irregular. | leads-ficha, imoveis-form |
| M6 | **33 cores hex e 24 `rgba()` soltos** fora de `styles.scss` (16 só na home; `marca.ts`, `vitrine.ts`, `imovel-publico`, `auth.scss`). | código |
| M7 | **Espaçamento sem escala**: 22px, 14px, 9px, 7px, 18px convivem; padding de cartão 16, de coluna 10, de célula 9×12. | global |
| M8 | **Sem atalhos além de "/"** (busca). Faltam: `n` novo lead, `g p`/`g l` navegação, `Esc` já existe só nas gavetas. | global |
| M9 | **Filtros no celular**: cada select ocupa uma linha a ~55% da largura; contagem "26 lead(s)" flutua à direita. | leads/pipeline/imóveis 375 |
| M10 | **Placeholder com contraste 2,6:1** (`--slate-400` sobre branco). Não é exigência AA, mas atrapalha quem lê com pouca visão. | global |
| M11 | **Home**: hero com foto genérica de banco de imagem (homem de terno), seis cartões em grade 3×2, FAQ em acordeão, faixa escura no meio da página clara. Mensagem central ("bot de WhatsApp que atende por você") não está no título. | home |
| M12 | **Home 375**: página com ~6.100px; a seção de recursos vira lista longa de 6 cartões empilhados. | home 375 |

## Nota por tela (0–10)

| Tela | Nota | Resumo |
|---|---|---|
| Home | **6** | Bem construída e acessível, mas genérica ("luxo" padrão) e sem a promessa do bot no título. |
| Painel | **6,5** | Informação certa; hierarquia plana nos KPIs, foco invisível, gráfico quebra no celular. |
| Leads | **5** | Filtros e paginação bons; tabela estoura no desktop e não serve no celular. |
| Funil | **6** | Arrastar + setas é ótimo para acessibilidade; não cabe em 1440 e não orienta no celular. |
| Conversas | **6,5** | Estrutura lista+thread correta; bot/humano pouco claros; mobile não é tela cheia. |
| Imóveis | **6,5** | Grade boa e pendências de portal úteis; cartões com ações demais. |
| Ajustes | **5** | Tudo funciona, mas é a tela com menos hierarquia; o fluxo do WhatsApp merece destaque próprio. |

## Ordem de ataque proposta (CRM primeiro, como combinado)

1. **Etapa 2 (tokens)** resolve C4, C5, A1, M6, M7, M10 de uma vez, sem mexer em layout.
2. **Etapa 5 (CRM desktop)**: C1, C2, A2, A6, A7, A8, M1, M4, M5, M8.
3. **Etapa 6 (mobile/PWA)**: C3, A3, A4, A5, A9, M9.
4. **Etapa 3 (home) + 4 (marca)**: A10, M2, M3, M11, M12.

Decisões já tomadas: prioridade CRM; Etapa 4 (brandkit) **incluída**; skill *impeccable* **não instalada**, porque as 7 skills locais já cobrem o mesmo escopo e uma 8ª só traria regras conflitantes.
