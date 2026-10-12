import { describe, expect, test } from 'claude-code/testing'

import { estadoDoStatus, robo } from '../hooks/robo'

describe('robo', () => {
  test('estado pelo status', () => {
    expect(estadoDoStatus('running')).toBe('trabalhando')
    expect(estadoDoStatus('completed')).toBe('feliz')
    expect(estadoDoStatus('killed')).toBe('falhou')
    expect(estadoDoStatus('waiting')).toBe('esperando')
    expect(estadoDoStatus(undefined)).toBe('parado')
    expect(estadoDoStatus(undefined, true)).toBe('trabalhando')
  })

  test('trabalhando alterna as pernas a cada quadro', () => {
    const a = robo('trabalhando', 0).linhas[2]
    const b = robo('trabalhando', 1).linhas[2]
    expect(a).not.toBe(b)
    expect(robo('trabalhando', 2).linhas[2]).toBe(a)
  })

  test('todas as linhas tem a mesma largura e quadro negativo nao quebra', () => {
    for (const e of ['trabalhando', 'parado', 'feliz', 'falhou', 'esperando'] as const) {
      const { linhas } = robo(e, -3)
      expect(new Set(linhas.map(l => l.length)).size).toBe(1)
    }
  })

  test('parado fica cinza e dorme', () => {
    const r = robo('parado', 0)
    expect(r.cor).toBe('gray')
    expect(r.etiqueta.includes('z')).toBe(true)
  })
})
