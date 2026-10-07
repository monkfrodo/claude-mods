import { describe, expect, test } from 'claude-code/testing'

import { ALTURA, FAIXAS, desenhar, mover, novo, passo } from '../hooks/jogo'

describe('corrida', () => {
  test('carro fica dentro das faixas', () => {
    let j = novo()
    for (let i = 0; i < 5; i++) j = mover(j, -1)
    expect(j.carro).toBe(0)
    for (let i = 0; i < 5; i++) j = mover(j, 1)
    expect(j.carro).toBe(FAIXAS - 1)
  })

  test('colisao acaba o jogo e congela', () => {
    const j = { ...novo(), carro: 1, obstaculos: [{ faixa: 1, y: ALTURA - 2 }] }
    const depois = passo(j)
    expect(depois.vivo).toBe(false)
    expect(passo(depois)).toBe(depois)
    expect(mover(depois, 1)).toBe(depois)
  })

  test('obstaculo em outra faixa passa e da pontos; recorde acompanha', () => {
    const j = { ...novo(), carro: 0, obstaculos: [{ faixa: 2, y: ALTURA - 1 }] }
    const depois = passo(j)
    expect(depois.vivo).toBe(true)
    expect(depois.pontos).toBeGreaterThanOrEqual(6)
    expect(depois.recorde).toBe(depois.pontos)
  })

  test('pista tem ALTURA linhas', () => {
    expect(desenhar(novo())).toHaveLength(ALTURA)
  })
})
