// Funcoes puras do dia-santo: data em America/Sao_Paulo, texto por extenso
// em portugues do Brasil e montagem da faixa. Sem acesso a `$`.

import { santoDoDia } from './santos'

export const DIAS_SEMANA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
] as const

export const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const

const SEPARADOR = ' · '

const pad = (n: number): string => String(n).padStart(2, '0')

/** Data AAAA-MM-DD em America/Sao_Paulo para o instante `ms`. */
export function dataSaoPaulo(ms: number): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(ms))
    const get = (t: string) => parts.find(p => p.type === t)?.value
    const y = get('year')
    const m = get('month')
    const d = get('day')
    if (y && m && d) return `${y}-${m}-${d}`
  } catch {
    // sem Intl/tz: cai no deslocamento fixo abaixo
  }
  // Brasil sem horario de verao desde 2019: UTC-3 fixo.
  const t = new Date(ms - 3 * 60 * 60 * 1000)
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}

/** "quarta-feira, 7 de outubro de 2026" a partir de "2026-10-07". */
export function dataPorExtenso(data: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data)
  if (!m) throw new Error(`data invalida: ${data}`)
  const ano = Number(m[1])
  const mes = Number(m[2])
  const dia = Number(m[3])
  const semana = DIAS_SEMANA[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()]
  const nomeMes = MESES[mes - 1]
  if (!semana || !nomeMes) throw new Error(`data invalida: ${data}`)
  const diaTexto = dia === 1 ? '1º' : String(dia)
  return `${semana}, ${diaTexto} de ${nomeMes} de ${ano}`
}

/** Corta `s` em `max` caracteres, com reticencias. */
export function cortar(s: string, max: number): string {
  if (max <= 0) return ''
  if (max === 1) return s.slice(0, 1)
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`
}

/**
 * Linha da faixa para a data AAAA-MM-DD, cabendo em `largura` colunas:
 * o santo e cortado primeiro; a data so e cortada se nem ela couber.
 */
export function montarFaixa(data: string, largura: number): string {
  const texto = dataPorExtenso(data)
  const santo = santoDoDia(data.slice(5))
  if (!santo) return cortar(texto, largura)
  const completo = `${texto}${SEPARADOR}${santo}`
  if (completo.length <= largura) return completo
  const resto = largura - texto.length - SEPARADOR.length
  if (resto >= 4) return `${texto}${SEPARADOR}${cortar(santo, resto)}`
  return cortar(texto, largura)
}
