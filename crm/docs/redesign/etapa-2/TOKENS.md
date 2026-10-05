# Etapa 2 — Cor e design tokens

Fonte única: [`crm/src/styles/_tokens.scss`](../../../src/styles/_tokens.scss). Exportação no formato DTCG (para Figma, Style Dictionary, Terrazzo): [tokens.dtcg.json](tokens.dtcg.json). Esse JSON é gerado a partir do SCSS e não deve ser editado à mão.

## Camadas

1. **Primitivos (OKLCH):** escalas por matiz, que dizem só "qual cor" e não "para quê".
   - `--ardosia-*` (h 257): neutros com um pingo do azul da marca.
   - `--marinho-*` (h 254): marca e ações.
   - `--ouro-*` (h 86): acento da marca.
   - `--verde-*`, `--vermelho-*`, `--ambar-*`: estados.
2. **Semânticos (`--cor-*`):** o papel na interface, redefinido no tema escuro. As páginas usam só estes.
3. **Escalas:** tipografia (`--texto-*`), espaço (`--esp-*`), raio (`--raio-*`), sombra (`--sombra-1..3`), camadas (`--z-*`) e movimento (`--dur-*`, `--curva-*`).

Os nomes antigos (`--navy-*`, `--slate-*`, `--ouro-texto`, `--primario`, `--superficie`…) continuam valendo como **apelidos** dos semânticos, no mixin `apelidos-legados` do `styles.scss`. Nenhuma página usa mais esses nomes; eles ficam por uma versão para código externo e depois podem sair.

## Semânticos

| Grupo | Tokens |
|---|---|
| Superfície | `--cor-fundo` · `--cor-superficie` · `--cor-superficie-hover` · `--cor-superficie-baixa` (cabeçalho de tabela, colunas do funil) · `--cor-superficie-funda` · `--cor-fundo-marca` (painéis marinho fixos) |
| Texto | `--cor-titulo` · `--cor-texto` · `--cor-texto-2` · `--cor-texto-3` · `--cor-texto-mudo` · `--cor-texto-desativado` · `--cor-placeholder` |
| Borda | `--cor-borda-suave` · `--cor-borda` · `--cor-borda-forte` · `--cor-borda-controle` (contorno de campo, 3:1) · `--cor-borda-controle-hover` |
| Ação | `--cor-acao` · `--cor-acao-hover` · `--cor-sobre-acao` · `--cor-link` · `--cor-destaque` |
| Foco | `--cor-foco` · `--cor-foco-suave` · `--foco` (anel duplo) |
| Estado | `--cor-{info,ganho,perda,alerta}` + `-fundo` e `-borda` · `--cor-erro-forte` |
| Marca | `--cor-marca` · `--cor-marca-clara` · `--cor-marca-escura` · `--cor-marca-texto` (o antigo `--ouro-texto`) · `--cor-marca-fio` · `--cor-marca-brilho` |
| Sobre a marca | `--cor-sobre-marca-{hover,ativo,borda,borda-forte,contorno}` · `--cor-lateral-*` |
| Outros | `--cor-inverso-*` · `--cor-codigo-*` · `--cor-veu` · `--cor-whatsapp` |

## Escalas

| Escala | Valores |
|---|---|
| **Texto:** segunda maior (1,125), base 14px, arredondada a 0,5px | `2xs` 11 · `xs` 12,5 · `sm` **14** · `md` 16 · `lg` 18 · `xl` 20 · `2xl` 22,5 · `3xl` 25 · `4xl` 28 · `5xl` 32 |
| **Espaço:** grade de 4px, com meio passo até 16 | `0-5` 2 · `1` 4 · `1-5` 6 · `2` 8 · `2-5` 10 · `3` 12 · `3-5` 14 · `4` 16 · `5` 20 · `6` 24 · `7` 28 · `8` 32 · `10` 40 · `12` 48 · `14` 56 · `16` 64 · `20` 80 · `24` 96 |
| **Raio** | `xs` 4 · `sm` 6 (botão, campo) · base 8 (cartão) · `lg` 12 (gaveta) · `xl` 16 · `pilula` |
| **Sombra** (tingida de marinho, luz de cima) | `1` cartão · `2` popover · `3` gaveta/diálogo |
| **Camadas** | `base` 1 · `fixo` 20 · `gaveta` 40 · `aviso` 60 · `topo` 100 |
| **Movimento** | 120 / 200 / 300 ms · `--curva-saida` (entradas) · `--curva-movimento` |

Os números já usavam `font-variant-numeric: tabular-nums` no `body`, e isso foi mantido. A fonte mono (`.mono`, `.num`) segue para valores em tabela.

Ficam como literais, de propósito, só estes casos:
- 1–3px: filetes e ajustes ópticos.
- Valores dentro de `clamp()`, `calc()` e `minmax()`.
- `line-height` em px de pílulas (avatar, contador).
- A cor padrão de site novo e da barra do navegador (`site.model.ts`, `tema.service.ts`), que são dados ou meta tags, não estilo.

## Contraste WCAG AA (claro e escuro)

Calculado sobre os tokens resolvidos (culori, `wcagContrast`). Texto pede 4,5:1, e componente/foco pede 3:1 (1.4.11).

| Uso | Par | Meta | Claro | Escuro |
|---|---|---|---|---|
| Texto principal | `--cor-texto` / `--cor-superficie` | 4.5:1 | 17.81 ✅ | 14.71 ✅ |
| Texto sobre o fundo | `--cor-texto` / `--cor-fundo` | 4.5:1 | 16.62 ✅ | 16.37 ✅ |
| Títulos | `--cor-titulo` / `--cor-superficie` | 4.5:1 | 17.27 ✅ | 15.42 ✅ |
| Texto secundário | `--cor-texto-2` / `--cor-superficie` | 4.5:1 | 10.34 ✅ | 10.93 ✅ |
| Cabeçalho de tabela | `--cor-texto-3` / `--cor-superficie-baixa` | 4.5:1 | 6.89 ✅ | 7.47 ✅ |
| Texto mudo | `--cor-texto-mudo` / `--cor-superficie` | 4.5:1 | 5.64 ✅ | 6.55 ✅ |
| Texto mudo / fundo | `--cor-texto-mudo` / `--cor-fundo` | 4.5:1 | 5.27 ✅ | 7.29 ✅ |
| Placeholder | `--cor-placeholder` / `--cor-superficie` | 4.5:1 | 4.65 ✅ | 4.69 ✅ |
| Desativado (isento) | `--cor-texto-desativado` / `--cor-superficie` | isento | 2.56 · | 3.73 · |
| Contorno de campo | `--cor-borda-controle` / `--cor-superficie` | 3:1 | 3.11 ✅ | 3.10 ✅ |
| Borda de cartão (decorativa) | `--cor-borda` / `--cor-superficie` | isento | 1.23 · | 1.37 · |
| Link | `--cor-link` / `--cor-superficie` | 4.5:1 | 6.86 ✅ | 6.83 ✅ |
| Link / fundo | `--cor-link` / `--cor-fundo` | 4.5:1 | 6.40 ✅ | 7.60 ✅ |
| Anel de foco | `--cor-foco` / `--cor-superficie` | 3:1 | 6.86 ✅ | 6.83 ✅ |
| Botão primário | `--cor-sobre-acao` / `--cor-acao` | 4.5:1 | 11.50 ✅ | 5.16 ✅ |
| Botão primário (hover) | `--cor-sobre-acao` / `--cor-acao-hover` | 4.5:1 | 15.21 ✅ | 6.70 ✅ |
| Aba ativa | `--cor-destaque` / `--cor-superficie` | 4.5:1 | 11.50 ✅ | 9.50 ✅ |
| Etiqueta fria / aviso info | `--cor-info` / `--cor-info-fundo` | 4.5:1 | 7.48 ✅ | 6.90 ✅ |
| Etiqueta ok | `--cor-ganho` / `--cor-ganho-fundo` | 4.5:1 | 5.19 ✅ | 7.65 ✅ |
| Etiqueta quente | `--cor-perda` / `--cor-perda-fundo` | 4.5:1 | 5.64 ✅ | 7.43 ✅ |
| Etiqueta morna / aviso | `--cor-alerta` / `--cor-alerta-fundo` | 4.5:1 | 5.20 ✅ | 8.27 ✅ |
| Erro em texto | `--cor-perda` / `--cor-superficie` | 4.5:1 | 6.81 ✅ | 8.33 ✅ |
| Ouro como texto (--ouro-texto) | `--cor-marca-texto` / `--cor-fundo` | 4.5:1 | 4.86 ✅ | 10.40 ✅ |
| Ouro como texto / superfície | `--cor-marca-texto` / `--cor-superficie` | 4.5:1 | 5.21 ✅ | 9.34 ✅ |
| Ouro decorativo (isento) | `--cor-marca` / `--cor-superficie` | isento | 2.43 · | 6.88 · |
| Ouro sobre o menu | `--cor-marca` / `--cor-lateral-fundo` | 3:1 | 7.11 ✅ | 7.71 ✅ |
| Menu | `--cor-lateral-texto` / `--cor-lateral-fundo` | 4.5:1 | 11.05 ✅ | 11.99 ✅ |
| Menu mudo | `--cor-lateral-mudo` / `--cor-lateral-fundo` | 4.5:1 | 6.07 ✅ | 6.59 ✅ |
| Bloco invertido | `--cor-inverso-texto` / `--cor-inverso-fundo` | 4.5:1 | 17.27 ✅ | 14.71 ✅ |
| Bloco de código | `--cor-codigo-texto` / `--cor-codigo-fundo` | 4.5:1 | 13.23 ✅ | 14.98 ✅ |
| Botão WhatsApp (público) | `--branco` / `--cor-whatsapp` | 4.5:1 | 5.33 ✅ | 5.33 ✅ |

### O que mudou por causa da auditoria

| Antes | Depois |
|---|---|
| Placeholder `--slate-400`: **2,56:1** ❌ | `--cor-placeholder` (ardósia 56%): **4,65:1** |
| Contorno de campo `--slate-300`: **1,48:1** ❌ (1.4.11) | `--cor-borda-controle` (ardósia 66%): **3,11:1** |
| Hover do botão primário no escuro: **4,10:1** ❌ (clareava) | Hover escurece: **6,70:1** |
| `select` sempre cinza (casava com `:read-only`), **C4** | Só `input`/`textarea` só-leitura ficam cinza |
| Cor de etapa do banco some no escuro (Proposta), **C5** | `.cor-etapa` + `--cor-etapa-visivel`: no escuro mistura 38% de branco em OKLCH |
| Painel de login no escuro usava `--navy-900` invertido (fundo claro com texto claro) | `--cor-fundo-marca`, fixo nos dois temas |
| `--ouro-texto` | Passa nos dois temas (4,86 e 10,40) e virou `--cor-marca-texto` |
| Neutros com matiz misturada (257 e 266) | Todos em h 257 |

## Números da migração

- **Cores:** 339 referências passaram para semânticos, escolhidos pela propriedade (`color` → texto, `border` → borda, `background` → superfície). Cerca de 30 hex/rgba soltos viraram tokens. Fora dos tokens restam só os 2 literais citados acima.
- **Tipografia:** 23 tamanhos distintos viraram uma escala de 10 (169 trocas).
- **Espaço e raio:** 398 trocas de espaçamento e 56 de raio. Os valores fora da grade foram para o passo mais próximo, o que dá diferença visual de no máximo 2px.
- `z-index` em escala.

## Como usar

```scss
.cartao-x {
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio);
  padding: var(--esp-4);
  font-size: var(--texto-sm);
  color: var(--cor-texto-2);
}
```

Regras:
- Página nunca usa primitivo (`--ardosia-500`) nem hex.
- Cor nova entra primeiro como semântico, nos dois temas.
- Para cada par texto/fundo novo, rode o contraste (meta 4,5:1).

Screenshots: [depois/](depois/), para comparar com [../etapa-1/antes/](../etapa-1/antes/). O axe-core continua sem violações automáticas, e nenhuma tela ganhou rolagem lateral.
