// Cliente da Evolution API (WhatsApp por QR code, uma instância por empresa).
// Secrets da função: EVOLUTION_URL (endereço público do túnel) e EVOLUTION_API_KEY (chave mestra).
import { ErroTela } from './comum.ts';

const base = () => (Deno.env.get('EVOLUTION_URL') ?? '').replace(/\/+$/, '');
export const evolutionConfigurada = () => !!base() && !!Deno.env.get('EVOLUTION_API_KEY');

/** Uma instância por empresa, com o nome derivado do endereço da empresa. */
export const nomeInstancia = (slug: string) => 'royal-' + slug;

export interface RespostaEvo { ok: boolean; status: number; json: any }

export async function evo(metodo: string, caminho: string, corpo?: unknown): Promise<RespostaEvo> {
  if (!evolutionConfigurada()) throw new ErroTela('A Evolution API não está configurada no servidor.', 503);
  try {
    const r = await fetch(base() + caminho, {
      method: metodo,
      headers: { apikey: Deno.env.get('EVOLUTION_API_KEY')!, 'content-type': 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: AbortSignal.timeout(45000),
    });
    return { ok: r.ok, status: r.status, json: await r.json().catch(() => ({})) };
  } catch {
    throw new ErroTela('Não consegui falar com o servidor do WhatsApp. O computador está ligado?', 502);
  }
}

/** Como `evo`, mas erro da API vira mensagem para a tela. */
export async function evoOk(metodo: string, caminho: string, corpo?: unknown) {
  const r = await evo(metodo, caminho, corpo);
  if (!r.ok) {
    const msg = r.json?.response?.message ?? r.json?.message ?? r.json?.error;
    throw new ErroTela('WhatsApp recusou (' + r.status + '): ' + (Array.isArray(msg) ? msg.join(', ') : String(msg ?? 'falhou')), 502);
  }
  return r.json;
}
