// IA para o painel: simulador da assistente, sugestão de primeira mensagem,
// mensagem de retomada e rascunho de site.
import { ErroTela, admin, comoUsuario, configDa, json, quemChamou, responder } from '../_shared/comum.ts';
import { Msg, carteira, descreverMarcadores, iaConfigurada, imoveisQueServem, instrucoes, lerMarcadores, pedirIA } from '../_shared/ia.ts';

Deno.serve(responder(async (req) => {
  const db = admin();
  const eu = await quemChamou(req, db);
  const b = await req.json().catch(() => ({}));
  if (!iaConfigurada()) throw new ErroTela('A IA ainda não foi ligada: falta a chave GROQ_API_KEY nos segredos das Edge Functions (veja o LEIA-ME).');

  const { data: emp } = await db.from('empresas').select('nome').eq('id', eu.empresa_id).single();
  const cfg = await configDa(db, eu.empresa_id);
  const empresa = emp?.nome ?? 'Imobiliária';

  switch (b.acao) {
    // ------------------------------------------------ simulador (não grava nada)
    case 'chat': {
      const cru = (Array.isArray(b.mensagens) ? b.mensagens : []).filter((m: any) => m?.texto).slice(-16);
      if (!cru.length) throw new ErroTela('Escreva uma mensagem.');
      const msgs: Msg[] = cru.map((m: any) => ({ role: m.papel === 'bot' ? 'assistant' : 'user', content: String(m.texto).slice(0, 2000) }));
      const procura = cru.filter((m: any) => m.papel !== 'bot').map((m: any) => m.texto).join(' ').slice(-1200);
      const todos = await carteira(db, eu.empresa_id);
      const lista = imoveisQueServem(todos, procura);
      const m = lerMarcadores(await pedirIA(instrucoes(cfg, empresa, lista), msgs));
      const acoes = descreverMarcadores(m);
      if (m.opcoes) acoes.push('Opções escolhidas: ' + imoveisQueServem(todos, procura, 3).map((x) => x.codigo).join(', '));
      return json({ texto: m.texto || '(a assistente só executaria as ações abaixo)', acoes });
    }

    // ------------------------------------------------ primeira mensagem para um lead
    case 'sugestao': {
      // lido com o login de quem pediu: só sai lead que essa pessoa pode ver
      const { data: l } = await comoUsuario(req).from('leads').select('*').eq('id', b.lead_id).maybeSingle();
      if (!l || l.empresa_id !== eu.empresa_id) throw new ErroTela('Lead não encontrado.', 404);
      const pedido = `Escreva a PRIMEIRA mensagem de WhatsApp do corretor ${cfg.corretor || ''} da ${empresa} para este lead que acabou de chegar. ` +
        `Use o primeiro nome dele, máximo 4 linhas, sem emoji, sem saudação formal. Termine com UMA pergunta simples.\n` +
        `Nome: ${l.nome}\nO que procura: ${l.interesse || 'não informado'}\nOrigem: ${l.origem} ${l.campanha}\nAnotações: ${l.obs || '—'}` +
        (cfg.estilo ? `\n\nJeito de escrever do corretor:\n${cfg.estilo}` : '');
      const texto = await pedirIA('Você escreve mensagens curtas de WhatsApp em português do Brasil, naturais, sem tom de robô.', [{ role: 'user', content: pedido }], 300);
      return json({ texto: lerMarcadores(texto).texto });
    }

    // ------------------------------------------------ retomar cliente parado
    case 'retomada': {
      const { data: c } = await comoUsuario(req).from('conversas').select('*').eq('id', b.conversa_id).maybeSingle();
      if (!c || c.empresa_id !== eu.empresa_id) throw new ErroTela('Conversa não encontrada.', 404);
      const { data: msgs } = await db.from('mensagens').select('de, texto').eq('conversa_id', c.id).order('id', { ascending: false }).limit(14);
      const conversa = (msgs ?? []).reverse().map((m: any) => (m.de === 'cliente' ? 'CLIENTE: ' : 'CORRETOR: ') + m.texto).join('\n');
      const dias = Math.max(1, Math.round((Date.now() - new Date(c.atualizado_em).getTime()) / 864e5));
      try {
        const texto = await pedirIA(instrucoes(cfg, empresa, []), [{
          role: 'user',
          content: `Esta conversa parou há ${dias} dia(s). Escreva APENAS a mensagem curta de retomada, continuando de onde parou ` +
            `e propondo um horário concreto de atendimento. Uma ou duas linhas, sem cobrar o cliente e sem código interno.\n\n${conversa}`,
        }], 250);
        return json({ texto: lerMarcadores(texto).texto, dias });
      } catch {
        const nome = String(c.nome || '').split(' ')[0];
        return json({ dias, texto: `Oi ${nome}, tudo bem? Separei umas opções novas que podem te interessar. Quer dar uma olhada?` });
      }
    }

    // ------------------------------------------------ aprender com conversas de verdade
    // O painel manda só os trechos já limpos (sem nome, telefone, e-mail nem link).
    // A IA lê o jeito do corretor responder e escreve as regras de estilo.
    // Nada é gravado aqui: volta para a tela, o corretor lê, corrige e salva.
    case 'aprender': {
      if (eu.papel !== 'admin') throw new ErroTela('Só o administrador treina a assistente.', 403);
      const trechos = String(b.trechos ?? '').slice(0, 24000);
      if (trechos.length < 200) throw new ErroTela('Poucas mensagens para aprender. Mande uma conversa com mais respostas suas.');
      const atual = String(b.estilo_atual ?? '').slice(0, 4000);

      const bruto = await pedirIA(
        'Você observa como um corretor de imóveis brasileiro escreve no WhatsApp e descreve o jeito dele para que uma assistente ' +
        'virtual escreva igual. Responda em português do Brasil, em texto simples, sem título, sem markdown e sem comentar a tarefa.',
        [{ role: 'user', content:
          'Abaixo estão trechos reais de conversas: a fala do cliente e a resposta do corretor.\n\n' +
          'Escreva o GUIA DE ESTILO dele, assim:\n' +
          '- 8 a 14 regras curtas, uma por linha, começando com verbo ("Responde em mensagens curtas, várias seguidas").\n' +
          '- Cubra: tamanho das mensagens, gírias e palavras que ele repete, uso de emoji, pontuação (espaço antes de ! e ?), ' +
          'como cumprimenta, como chama o cliente, como diz sim e como diz não, como fala de dinheiro e de prazo, como fecha assunto.\n' +
          '- Depois uma linha em branco e "Frases típicas dele:" com 6 a 10 frases curtas copiadas ou muito parecidas com as dele.\n' +
          '- Só descreva o que aparece nos trechos. Não invente, não dê conselho de vendas, não escreva regra genérica de atendimento.\n' +
          (atual ? '\nJá existe este guia; mantenha o que continua verdadeiro e atualize o resto:\n"""' + atual + '"""\n' : '') +
          '\nTRECHOS:\n"""' + trechos + '"""' }],
        900);

      const estilo = bruto.replace(/^```[a-z]*|```$/gm, '').trim();
      if (!estilo) throw new ErroTela('A IA não conseguiu ler essas conversas. Tente com outra exportação.');
      return json({ estilo });
    }

    // ------------------------------------------------ rascunho de site
    case 'site': {
      if (eu.papel !== 'admin') throw new ErroTela('Só o administrador cria sites.', 403);
      const descricao = String(b.descricao ?? '').slice(0, 2000);
      if (!descricao.trim()) throw new ErroTela('Descreva como o site deve ser.');
      const bruto = await pedirIA(
        'Você monta a configuração de um site de imobiliária. Responda SOMENTE um JSON válido, sem texto antes ou depois.',
        [{ role: 'user', content:
          `Descrição do cliente: """${descricao}"""\n\nDevolva este JSON (em português):\n` +
          `{"nome":"nome da imobiliária","titulo":"chamada principal curta e forte","subtitulo":"linha de apoio","sobre":"2 a 4 frases sobre a imobiliária",` +
          `"cor":"#RRGGBB (cor principal pedida; escura o bastante para texto branco)","fundo":"claro|escuro","fonte":"moderna|classica",` +
          `"filtro":{"tipos":["Casa","Apartamento"...] ou [] para todos,"cidade":"" ou a cidade,"precoMax":0 ou o teto em reais}}` }],
        700);
      const achado = bruto.match(/\{[\s\S]*\}/);
      let site: any = {};
      try { site = JSON.parse(achado?.[0] ?? '{}'); } catch { throw new ErroTela('A IA respondeu num formato inesperado. Tente de novo.'); }
      if (!/^#[0-9a-f]{6}$/i.test(site.cor ?? '')) site.cor = '#1E3A5F';
      if (!['claro', 'escuro'].includes(site.fundo)) site.fundo = 'claro';
      if (!['moderna', 'classica'].includes(site.fonte)) site.fonte = 'moderna';
      site.filtro = {
        tipos: Array.isArray(site.filtro?.tipos) ? site.filtro.tipos.map(String) : [],
        cidade: String(site.filtro?.cidade ?? ''),
        precoMax: Number(site.filtro?.precoMax) || undefined,
      };
      return json({ site });
    }

    default:
      throw new ErroTela('Ação desconhecida.');
  }
}));
