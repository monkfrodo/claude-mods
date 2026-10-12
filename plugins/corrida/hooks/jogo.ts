// Logica pura da corrida: 3 faixas, obstaculos descem, o carro troca de faixa.

import type { Jogo } from '../types'

export const FAIXAS = 3
export const ALTURA = 8

/** Jogo novo; o recorde atravessa as partidas. */
export function novo(recorde = 0, seed = 1): Jogo {
  return { carro: 1, obstaculos: [], pontos: 0, recorde, vivo: true, seed }
}

/** Proximo numero pseudo-aleatorio (LCG) e o novo seed. */
function sortear(seed: number): [number, number] {
  const s = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff
  return [s, s]
}

/** Move o carro `dir` (-1 ou +1) dentro das faixas; jogo acabado nao se mexe. */
export function mover(j: Jogo, dir: -1 | 1): Jogo {
  if (!j.vivo) return j
  return { ...j, carro: Math.min(FAIXAS - 1, Math.max(0, j.carro + dir)) }
}

/** Um passo: obstaculos descem, as vezes nasce um, e a colisao acaba o jogo. */
export function passo(j: Jogo): Jogo {
  if (!j.vivo) return j
  let seed = j.seed
  const descidos = j.obstaculos.map(o => ({ ...o, y: o.y + 1 })).filter(o => o.y < ALTURA)
  const passaram = j.obstaculos.length - descidos.length
  const [r1, s1] = sortear(seed)
  seed = s1
  if (r1 % 3 === 0) {
    const [r2, s2] = sortear(seed)
    seed = s2
    descidos.push({ faixa: r2 % FAIXAS, y: 0 })
  }
  const bateu = descidos.some(o => o.y === ALTURA - 1 && o.faixa === j.carro)
  const pontos = j.pontos + 1 + passaram * 5
  return {
    ...j,
    obstaculos: descidos,
    pontos,
    recorde: Math.max(j.recorde, pontos),
    vivo: !bateu,
    seed,
  }
}

/** Linhas de texto da pista (ALTURA linhas) para desenhar. */
export function desenhar(j: Jogo): string[] {
  const linhas: string[] = []
  for (let y = 0; y < ALTURA; y++) {
    const celulas: string[] = []
    for (let f = 0; f < FAIXAS; f++) {
      if (y === ALTURA - 1 && f === j.carro) celulas.push(j.vivo ? ' 🏎 ' : ' 💥 ')
      else if (j.obstaculos.some(o => o.y === y && o.faixa === f)) celulas.push(' ▓▓ ')
      else celulas.push('    ')
    }
    linhas.push(`|${celulas.join('¦')}|`)
  }
  return linhas
}
