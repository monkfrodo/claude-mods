// Funcoes puras do time-agentes: modelo por tipo de subagente e barras de consumo.

/** Modelo de cada tipo de subagente. Edite para ajustar ao seu time; tipo fora da lista fica como esta. */
export const MODELOS: Readonly<Record<string, string>> = {
  Explore: 'claude-haiku-5-5',
  Plan: 'claude-opus-5-5',
  'general-purpose': 'claude-sonnet-5-5',
}

/** Modelo a usar no spawn: o que a chamada ja pediu manda; senao, o da tabela. */
export function modeloDoTipo(tipo: string, pedido?: string): string | undefined {
  return pedido ?? MODELOS[tipo]
}

/** Barra de `largura` celulas com `parte` de `total` preenchido. */
export function barra(parte: number, total: number, largura = 12): string {
  const f = total > 0 ? Math.min(1, Math.max(0, parte / total)) : 0
  const cheias = Math.round(f * largura)
  return '█'.repeat(cheias) + '░'.repeat(largura - cheias)
}

/** 1234 -> "1,2k"; 2_500_000 -> "2,5M". */
export function compacto(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')}k`
  return String(n)
}

/** Soma de tokens do registro. */
export function totalTokens(registro: Readonly<Record<string, { tokens: number }>>): number {
  return Object.values(registro).reduce((s, a) => s + a.tokens, 0)
}
