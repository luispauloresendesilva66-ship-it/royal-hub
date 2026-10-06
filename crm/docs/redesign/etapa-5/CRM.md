# Etapa 5 — Polimento do CRM (desktop)

Screenshots em [depois/](depois/) (1440 e 375, mais tema escuro), para comparar com [../etapa-1/antes/](../etapa-1/antes/).
No claro e no escuro, o axe-core (WCAG 2 A/AA + boas práticas) não acusa violações, nenhuma tela tem rolagem lateral e o console fica sem erros.

## O que resolveu da auditoria

| Item | Antes | Depois |
|---|---|---|
| **C1** foco nos KPIs | a sombra do cartão apagava o anel | anel de foco duplo visível (testado com teclado nos dois temas) |
| **C2** tabela de Leads | 9 colunas, "Entrou" cortada em 1440 | origem e campanha viraram a linha de baixo do nome: 8 colunas cabem |
| **A2** funil | a 6ª coluna cortada em 1440 | colunas de 184px: as 6 etapas cabem; as setas viraram ícones |
| **A4** gráfico no celular | "3/0", "5/0" (datas cortadas) | no celular só o dia; o mês volta no desktop |
| **A6** bot e humano | balões quase iguais | assistente em azul com o robô; equipe em marinho cheio com a pessoa; a barra de estado fica verde (assistente ativa) ou âmbar (pausada) |
| **A7** Ajustes → WhatsApp | um cartão entre quatro | no topo, largura toda, com o passo a passo: *Escolha como ligar → Escaneie o QR (ou Cole os dados da Meta) → Pronto para atender* |
| **A8** carregando | texto solto | esqueletos no formato do conteúdo (painel, leads, funil, conversas, imóveis, equipe) |
| **M1** KPIs iguais | seis cartões idênticos | "Leads no mês" ocupa o dobro, número maior e fio dourado |
| **M2** rótulos mono em caixa alta | KPIs, autores de mensagem | sans 12,5px, peso médio |
| **M3** títulos em Cinzel | todas as telas | Plex Sans 600 (o Cinzel ficou só na marca A) |
| **M4** cartão de imóvel | três botões por cartão | "Editar" + ícones para ver a página e copiar o link (com rótulo para leitor de tela); preço em sans |
| **M5** placeholder com cara de valor | "850.000" | "Ex.: 450.000" |
| **M8** atalhos | só `/` | `/` busca · `n` novo lead · `g` + letra troca de tela · `?` lista os atalhos (também no menu) |

## Componentes novos e consistência

- `shared/ui/icone.ts`: `<app-icone nome="…">` com Phosphor Regular. O SVG vira máscara CSS, então a cor segue o texto e nada passa por `innerHTML`. Para acrescentar um ícone: importe o `.svg` e ponha no mapa.
- No `styles.scss`:
  - `.esqueleto`: brilho só quando o sistema permite movimento;
  - `kbd`;
  - `.vazio` com espaço para ícone e título;
  - `.btn` com `scale(.98)` ao clicar.
- O menu lateral ganhou ícones. O item ativo fica com o ícone em ouro claro.
- Logo B (edifício) é a marca oficial: componente, favicon, ícones de PWA e `og.jpg`.

## Ficou para a etapa 6 (mobile)

- Leads em cartões no lugar da tabela (C3).
- Conversas em tela cheia.
- Navegação inferior.
- Screenshots de desktop menores na home do celular.
