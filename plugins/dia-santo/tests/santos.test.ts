import { describe, expect, test } from 'claude-code/testing'

import { dataPorExtenso, dataSaoPaulo, montarFaixa } from '../hooks/data'
import { SANTOS, santoDoDia } from '../hooks/santos'

const pad = (n: number): string => String(n).padStart(2, '0')

/** As 366 chaves MM-DD de um ano bissexto (2024). */
function todasAsChaves(): string[] {
  const out: string[] = []
  for (let t = Date.UTC(2024, 0, 1); t < Date.UTC(2025, 0, 1); t += 86_400_000) {
    const d = new Date(t)
    out.push(`${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`)
  }
  return out
}

describe('tabela de santos', () => {
  test('366 entradas, uma por dia, sem vazias nem duplicadas', () => {
    const chaves = SANTOS.map(([k]) => k)
    expect(chaves.length).toBe(366)
    expect(new Set(chaves).size).toBe(366)
    expect([...chaves].sort()).toEqual(todasAsChaves())
    for (const [k, nome] of SANTOS) {
      expect(typeof nome).toBe('string')
      expect(nome.trim().length > 0 ? k : `${k} vazia`).toBe(k)
      expect(nome).toBe(nome.trim())
    }
    expect(new Set(SANTOS.map(([, n]) => n)).size).toBe(366)
  })

  test('casos conhecidos', () => {
    expect(santoDoDia('10-07')).toBe('Nossa Senhora do Rosário')
    expect(santoDoDia('10-12')).toBe('Nossa Senhora Aparecida')
    expect(santoDoDia('12-25')).toBe('Natal do Senhor')
    expect(santoDoDia('12-08')).toBe('Imaculada Conceição de Nossa Senhora')
    expect(santoDoDia('01-01')).toBe('Santa Maria, Mãe de Deus')
    expect(santoDoDia('02-29')).toBe('São Osvaldo de Worcester')
    expect(santoDoDia('02-30')).toBe(undefined)
  })
})

describe('data por extenso', () => {
  test('America/Sao_Paulo, inclusive perto da meia-noite UTC', () => {
    // 2026-10-08 02:59 UTC = 2026-10-07 23:59 em Sao Paulo
    expect(dataSaoPaulo(Date.UTC(2026, 9, 8, 2, 59))).toBe('2026-10-07')
    expect(dataSaoPaulo(Date.UTC(2026, 9, 8, 3, 0))).toBe('2026-10-08')
  })

  test('dia da semana e mes por extenso', () => {
    expect(dataPorExtenso('2026-10-07')).toBe('quarta-feira, 7 de outubro de 2026')
    expect(dataPorExtenso('2026-10-11')).toBe('domingo, 11 de outubro de 2026')
    expect(dataPorExtenso('2026-03-14')).toBe('sábado, 14 de março de 2026')
    expect(dataPorExtenso('2024-02-29')).toBe('quinta-feira, 29 de fevereiro de 2024')
    expect(dataPorExtenso('2026-01-01')).toBe('quinta-feira, 1º de janeiro de 2026')
    expect(dataPorExtenso('2026-12-25')).toBe('sexta-feira, 25 de dezembro de 2026')
    expect(dataPorExtenso('2026-09-01')).toBe('terça-feira, 1º de setembro de 2026')
  })

  test('faixa completa e cortes por largura', () => {
    const cheia = 'quarta-feira, 7 de outubro de 2026 · Nossa Senhora do Rosário'
    expect(montarFaixa('2026-10-07', 200)).toBe(cheia)
    expect(montarFaixa('2026-10-07', cheia.length)).toBe(cheia)
    // corta o santo, nunca a data, enquanto houver espaco
    expect(montarFaixa('2026-10-07', 45)).toBe('quarta-feira, 7 de outubro de 2026 · Nossa S…')
    // sem espaco para o santo: so a data
    expect(montarFaixa('2026-10-07', 36)).toBe('quarta-feira, 7 de outubro de 2026')
    // nem a data cabe: corta a data
    expect(montarFaixa('2026-10-07', 12)).toBe('quarta-feir…')
    for (let w = 10; w <= 80; w++) {
      expect(montarFaixa('2026-10-07', w).length <= w).toBe(true)
    }
  })
})
