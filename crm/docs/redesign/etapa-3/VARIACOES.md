# Etapa 3 — Três variações da home

Protótipos estáticos em `crm/prototipos/home/` (abra com `python -m http.server 4341` dentro da pasta). Screenshots em [variacoes/](variacoes/).

As três têm o mesmo conteúdo e a mesma estrutura:
1. **Hero:** "O bot de WhatsApp que atende por você." + CRM para imobiliárias.
2. **Como funciona:** conectar por QR, a assistente atende, o funil organiza, a carteira vira site.
3. **Benefícios.**
4. **CTA único:** "Quero conhecer". No topo, "Entrar" é outra intenção (login de quem já é cliente).
5. **Rodapé.**

As imagens são **screenshots reais do produto** tirados do modo demo, e não telas desenhadas com `div`.

| | V1 · Refino da atual | V2 · Caminho 3D | V3 · Minimalista editorial |
|---|---|---|---|
| Ideia | Marinho e ouro da marca. Hero escuro com a conversa real num celular. "Como funciona" em grade assimétrica. | O protótipo 3D "Caminho": um fio de luz passa pelas 4 estações conforme a rolagem. Página toda escura. | Sans grande (IBM Plex), muito respiro, ouro só como fio. O produto aparece grande logo abaixo do título. |
| Tipografia | Cinzel nos títulos e Plex no texto | Cinzel nos títulos e Plex no texto | Só Plex (Cinzel só no logo) |
| Peso extra | nenhum | Three.js ~150 kB, carregado depois do texto e nunca com "reduzir movimento" | nenhum |
| LCP provável | foto do celular (webp de 74 kB) | o título (texto) | screenshot (webp de 74 kB) |
| Risco | Mais "luxo padrão", próximo da atual | GPU no celular e rolagem longa | Menos "Royal": a marca aparece pouco |
| axe (WCAG A/AA) | 0 violações | 0 violações | 0 violações |

Para implementar a escolhida no Angular, mantendo a rota `''` e o `inicioGuard`:
- Fontes self-hosted em woff2 com `font-display: swap` e preload da fonte do título. Sai o `<link>` do Google Fonts.
- Imagens em webp com `srcset` (versão para celular), `width`/`height` e `fetchpriority` no LCP.
- `meta description`, Open Graph e Twitter Card, `canonical` e imagem OG 1200×630.
- Tokens da etapa 2 e mobile-first.
