// Funcoes puras da barra-creditos: sem acesso a `$`.

const CHEIO = '█'
const VAZIO = '░'

/** Barra de `largura` celulas com `restante` (0-100) preenchido. */
export function barra(restante: number, largura = 10): string {
  const r = Math.min(100, Math.max(0, restante))
  const cheias = Math.round((r / 100) * largura)
  return CHEIO.repeat(cheias) + VAZIO.repeat(largura - cheias)
}

const NOMES: Record<string, string> = {
  five_hour: '5h',
  seven_day: '7d',
  spend_limit: 'gasto',
}

/** "5h ████████░░ 80%" para um limite com `percentUsed` (o que resta diminui). */
export function linhaLimite(kind: string, percentUsed: number): string {
  const restante = Math.round(Math.min(100, Math.max(0, 100 - percentUsed)))
  return `${NOMES[kind] ?? kind} ${barra(restante)} ${restante}%`
}

/** Linha inteira da faixa; vazia quando nao ha nenhum dado. */
export function montarLinha(
  limites: ReadonlyArray<{ kind: string; percentUsed: number }>,
  custo: number | null,
): string {
  const partes = limites.map(l => linhaLimite(l.kind, l.percentUsed))
  if (custo !== null) partes.push(`$${custo.toFixed(2)}`)
  return partes.join(' · ')
}
