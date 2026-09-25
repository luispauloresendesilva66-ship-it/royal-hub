// Lê conversas exportadas do WhatsApp e transforma em material de treino.
//
// O WhatsApp exporta a conversa como um .txt (às vezes dentro de um .zip, junto
// com as mídias). Aqui o arquivo é lido NO NAVEGADOR: nada sai do computador
// antes de estar limpo. O que sai daqui é só o diálogo, sem nome de cliente,
// sem telefone, sem e-mail e sem CPF — o suficiente para a IA aprender o JEITO
// de falar, nada que identifique alguém.
//
// Formatos aceitos:
//   [30/07/26, 17:55:45] Fulano: mensagem
//   [7/30/26, 5:55:45 PM] Fulano: mensagem
//   30/07/2026 17:55 - Fulano: mensagem

export interface Fala {
  quem: 'corretor' | 'cliente';
  texto: string;
}

export interface ConversaLida {
  arquivo: string;
  falas: Fala[];
}

/* ==================== zip (sem biblioteca) ====================
   Um .zip é uma lista de arquivos com um índice no fim. Aqui a gente lê o
   índice, pega só os arquivos de texto e descomprime com o próprio navegador
   (DecompressionStream), que já sabe fazer isso. */
async function inflar(dados: Uint8Array, comprimido: boolean): Promise<Uint8Array> {
  if (!comprimido) return dados;
  const fluxo = new Blob([dados as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(fluxo).arrayBuffer());
}

export async function lerZip(arquivo: File): Promise<{ nome: string; texto: string }[]> {
  const buf = new Uint8Array(await arquivo.arrayBuffer());
  const v = new DataView(buf.buffer);
  const u16 = (p: number) => v.getUint16(p, true);
  const u32 = (p: number) => v.getUint32(p, true);

  // o índice (central directory) fica no fim, depois da assinatura 0x06054b50
  let fim = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 66000; i--) {
    if (u32(i) === 0x06054b50) { fim = i; break; }
  }
  if (fim < 0) throw new Error('Esse .zip não parece um arquivo válido.');

  let p = u32(fim + 16);                       // onde começa o índice
  const quantos = u16(fim + 10);
  const saida: { nome: string; texto: string }[] = [];
  const texto = new TextDecoder('utf-8');

  for (let i = 0; i < quantos && p + 46 <= buf.length; i++) {
    if (u32(p) !== 0x02014b50) break;
    const metodo = u16(p + 10);
    const tamComp = u32(p + 20);
    const tamNome = u16(p + 28);
    const tamExtra = u16(p + 30);
    const tamComent = u16(p + 32);
    const inicio = u32(p + 42);
    const nome = texto.decode(buf.subarray(p + 46, p + 46 + tamNome));
    p += 46 + tamNome + tamExtra + tamComent;

    if (!/\.(txt|md)$/i.test(nome) || nome.startsWith('__MACOSX')) continue;
    if (u32(inicio) !== 0x04034b50) continue;
    const nomeLocal = u16(inicio + 26);
    const extraLocal = u16(inicio + 28);
    const dados = buf.subarray(inicio + 30 + nomeLocal + extraLocal, inicio + 30 + nomeLocal + extraLocal + tamComp);
    try {
      saida.push({ nome, texto: texto.decode(await inflar(dados, metodo === 8)) });
    } catch { /* arquivo quebrado: passa para o próximo */ }
  }
  return saida;
}

/* ==================== o texto exportado ==================== */
const LINHA = /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:[AP]M)?\]?\s*(?:-\s*)?([^:]{1,60}):\s?([\s\S]*)$/;

// coisas que não são conversa
const LIXO = [
  /criptografia de ponta a ponta/i, /<m[ií]dia oculta>/i, /<mensagem (de voz|editada) (omitida|ocultada)>/i,
  /<(imagem|v[ií]deo|[áa]udio|documento|figurinha|sticker|gif|contato)[^>]*(omitid|ocultad)[^>]*>/i,
  /^\(arquivo anexado\)$/i, /mensagem apagada/i, /^POLL:/i, /BEGIN:VCARD/i,
  /criou este grupo|adicionou|saiu do grupo|mudou o assunto/i,
  /chamada (de v[íi]deo )?(perdida|de voz)/i,
];

const limpar = (t: string) =>
  t.replace(/‎|‏/g, '')
    .replace(/https?:\/\/\S+/g, '')                        // links somem
    .replace(/\b[\w.+-]+@[\w.-]+\.\w{2,}\b/gi, '')         // e-mail some
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '')      // CPF some
    .replace(/(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/g, '')  // telefone some
    .replace(/\b\d{6,}\b/g, '')                            // qualquer número longo
    .replace(/\s{2,}/g, ' ')
    .trim();

/** Transforma o texto exportado em falas, já anonimizadas. */
export function lerConversa(nomeArquivo: string, bruto: string): ConversaLida {
  const falas: Fala[] = [];
  let atual: Fala | null = null;

  for (const linha of bruto.split(/\r?\n/)) {
    const m = linha.match(LINHA);
    if (m) {
      const autor = m[3].trim();
      const texto = limpar(m[4]);
      // "Você" é sempre quem exportou — o corretor
      const quem: Fala['quem'] = /^(voc[êe]|you)$/i.test(autor) ? 'corretor' : 'cliente';
      if (!texto || LIXO.some((r) => r.test(m[4]))) { atual = null; continue; }
      if (atual && atual.quem === quem) atual.texto += '\n' + texto;   // mensagens seguidas viram uma fala
      else { atual = { quem, texto }; falas.push(atual); }
      continue;
    }
    // linha solta = continuação da mensagem anterior
    if (atual && linha.trim() && !LIXO.some((r) => r.test(linha))) {
      const t = limpar(linha);
      if (t) atual.texto += '\n' + t;
    }
  }
  return { arquivo: nomeArquivo.split('/').pop() || nomeArquivo, falas };
}

/** Aceita .zip, .txt ou .md e devolve as conversas lidas. */
export async function lerArquivos(arquivos: File[]): Promise<ConversaLida[]> {
  const saida: ConversaLida[] = [];
  for (const a of arquivos) {
    if (/\.zip$/i.test(a.name)) {
      for (const dentro of await lerZip(a)) saida.push(lerConversa(dentro.nome, dentro.texto));
    } else {
      saida.push(lerConversa(a.name, await a.text()));
    }
  }
  return saida.filter((c) => c.falas.length > 1);
}

/* ==================== o que vai para a IA ====================
   Só os trechos em que o corretor respondeu: é o jeito DELE que interessa.
   Cada trecho leva a fala do cliente antes, para a resposta fazer sentido. */
export function trechosParaTreino(conversas: ConversaLida[], limite = 120): string {
  const trechos: string[] = [];
  for (const c of conversas) {
    for (let i = 0; i < c.falas.length; i++) {
      if (c.falas[i].quem !== 'corretor') continue;
      const antes = i > 0 && c.falas[i - 1].quem === 'cliente' ? c.falas[i - 1].texto : '';
      const resposta = c.falas[i].texto.slice(0, 600);
      if (resposta.length < 2) continue;
      trechos.push((antes ? 'CLIENTE: ' + antes.slice(0, 400) + '\n' : '') + 'CORRETOR: ' + resposta);
    }
  }
  // as mais recentes valem mais: pega do fim
  return trechos.slice(-limite).join('\n\n');
}

export const contarFalas = (conversas: ConversaLida[]) => ({
  conversas: conversas.length,
  suas: conversas.reduce((n, c) => n + c.falas.filter((f) => f.quem === 'corretor').length, 0),
  doCliente: conversas.reduce((n, c) => n + c.falas.filter((f) => f.quem === 'cliente').length, 0),
});
