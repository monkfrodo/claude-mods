import { describe, expect, test } from 'claude-code/testing'

import { estadoDoStatus, robo } from '../hooks/robo'

const texto = (q: number) =>
  robo('trabalhando', q)
    .grade.map(l => l.map(c => `${c.txt}${c.cor}${c.apagada}`).join('|'))
    .join('/')

describe('indicador', () => {
  test('estado pelo status', () => {
    expect(estadoDoStatus('running')).toBe('trabalhando')
    expect(estadoDoStatus('completed')).toBe('feliz')
    expect(estadoDoStatus('killed')).toBe('falhou')
    expect(estadoDoStatus('waiting')).toBe('esperando')
    expect(estadoDoStatus(undefined)).toBe('parado')
    expect(estadoDoStatus(undefined, true)).toBe('trabalhando')
  })

  test('trabalhando: a bolinha acesa anda e volta apos 8 quadros', () => {
    expect(texto(0)).not.toBe(texto(1))
    expect(texto(8)).toBe(texto(0))
  })

  test('trabalhando: uma bolinha acesa e duas de rastro apagadas', () => {
    const celulas = robo('trabalhando', 3).grade.flat()
    const laranja = celulas.filter(c => c.cor === '#D97757' && c.txt === '● ')
    expect(laranja).toHaveLength(3)
    expect(laranja.filter(c => !c.apagada)).toHaveLength(1)
  })

  test('grade sempre 3x3 e quadro negativo nao quebra', () => {
    for (const e of ['trabalhando', 'parado', 'feliz', 'falhou', 'esperando'] as const) {
      const { grade } = robo(e, -5)
      expect(grade).toHaveLength(3)
      for (const linha of grade) expect(linha).toHaveLength(3)
    }
  })

  test('concluido tem ✓ e falhou tem ✗ no centro; parado fica cinza', () => {
    expect(robo('feliz', 0).grade[1]?.[1]?.txt).toBe('✓ ')
    expect(robo('falhou', 0).grade[1]?.[1]?.txt).toBe('✗ ')
    expect(robo('parado', 0).cor).toBe('gray')
  })
})
