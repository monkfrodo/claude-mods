import { describe, expect, test } from 'claude-code/testing'

import { barra, compacto, corDoUso, segmentos, corDaFatia, iconeStatus, modeloDoTipo, totalTokens } from '../hooks/time'

describe('time-agentes', () => {
  test('modelo da tabela, e o pedido manda', () => {
    expect(modeloDoTipo('Explore')).toBe('claude-haiku-5-5')
    expect(modeloDoTipo('Explore', 'opus')).toBe('opus')
    expect(modeloDoTipo('outro')).toBeUndefined()
  })

  test('barra proporcional', () => {
    expect(barra(5, 10, 10)).toBe('█████░░░░░')
    expect(barra(1, 0, 4)).toBe('░░░░')
    expect(barra(99, 10, 4)).toBe('████')
  })

  test('compacto e total', () => {
    expect(compacto(999)).toBe('999')
    expect(compacto(1234)).toBe('1,2k')
    expect(compacto(2_500_000)).toBe('2,5M')
    expect(totalTokens({ a: { tokens: 3 }, b: { tokens: 4 } })).toBe(7)
  })
})

describe('visual', () => {
  test('cor pela fatia do total', () => {
    expect(corDaFatia(1, 10)).toBe('green')
    expect(corDaFatia(5, 10)).toBe('yellow')
    expect(corDaFatia(9, 10)).toBe('red')
    expect(corDaFatia(1, 0)).toBe('green')
  })

  test('icone por status', () => {
    expect(iconeStatus('running').icone).toBe('●')
    expect(iconeStatus('failed').cor).toBe('red')
    expect(iconeStatus(undefined).icone).toBe('○')
  })
})

describe('segmentos', () => {
  test('cheias + vazias = largura', () => {
    expect(segmentos(5, 10, 10)).toEqual({ cheias: 5, vazias: 5 })
    expect(segmentos(1, 0, 6)).toEqual({ cheias: 0, vazias: 6 })
    expect(segmentos(99, 10, 6)).toEqual({ cheias: 6, vazias: 0 })
  })
})

describe('corDoUso', () => {
  test('verde, amarelo, vermelho pelo que ja gastou', () => {
    expect(corDoUso(13)).toBe('green')
    expect(corDoUso(70)).toBe('yellow')
    expect(corDoUso(95)).toBe('red')
  })
})
