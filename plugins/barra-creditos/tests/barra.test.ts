import { describe, expect, test } from 'claude-code/testing'

import { barra, linhaLimite, montarLinha } from '../hooks/barra'

describe('barra', () => {
  test('preenche pelo que resta', () => {
    expect(barra(100, 10)).toBe('██████████')
    expect(barra(50, 10)).toBe('█████░░░░░')
    expect(barra(0, 10)).toBe('░░░░░░░░░░')
  })

  test('limita fora de 0-100', () => {
    expect(barra(250, 4)).toBe('████')
    expect(barra(-5, 4)).toBe('░░░░')
  })

  test('linha de limite mostra o que resta', () => {
    expect(linhaLimite('five_hour', 20)).toBe('5h ████████░░ 80%')
  })

  test('linha inteira junta limites e custo', () => {
    expect(montarLinha([{ kind: 'five_hour', percentUsed: 0 }], 1.5)).toBe('5h ██████████ 100% · $1.50')
    expect(montarLinha([], null)).toBe('')
  })
})
