import { describe, expect, test } from 'claude-code/testing'

import { barra, compacto, modeloDoTipo, totalTokens } from '../hooks/time'

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
