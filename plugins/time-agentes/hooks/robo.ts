// Indicador de cada agente: um anel 3x3 de bolinhas em pixel. Trabalhando, uma bolinha
// laranja com rastro gira pelo anel; parado, o anel fica cinza e apagado.

export type Estado = 'trabalhando' | 'parado' | 'feliz' | 'falhou' | 'esperando'

/** Uma celula do anel: duas colunas de texto (bolinha + espaco), para ficar quadrada. */
export type Celula = { txt: string; cor: string; apagada: boolean }

export type Sprite = {
  /** Grade 3x3; o centro fica livre para o icone do estado. */
  grade: Celula[][]
  cor: string
  /** Texto curto ao lado do nome: o que ele esta fazendo. */
  etiqueta: string
}

const LARANJA = '#D97757'
const GIRO = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

/** As 8 posicoes do anel, em sentido horario a partir do canto superior esquerdo. */
const ANEL: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 2],
  [2, 2],
  [2, 1],
  [2, 0],
  [1, 0],
]

const VAZIA: Celula = { txt: '  ', cor: 'gray', apagada: true }
const BOLA = (cor: string, apagada: boolean): Celula => ({ txt: '● ', cor, apagada })

/** Grade com o anel todo em `cor`; `centro` e o texto da celula do meio. */
function anel(cor: string, apagada: boolean, centro = '  '): Celula[][] {
  const g: Celula[][] = [0, 1, 2].map(() => [VAZIA, VAZIA, VAZIA])
  for (const [r, c] of ANEL) (g[r] as Celula[])[c] = BOLA(cor, apagada)
  ;(g[1] as Celula[])[1] = { txt: centro, cor, apagada: false }
  return g
}

/** Estado do indicador pelo status do agente; `ativo` e para o principal, que nao tem status. */
export function estadoDoStatus(status: string | undefined, ativo = false): Estado {
  switch (status) {
    case 'running':
      return 'trabalhando'
    case 'completed':
      return 'feliz'
    case 'failed':
    case 'killed':
      return 'falhou'
    case 'waiting':
    case 'pending':
      return 'esperando'
    case 'idle':
      return 'parado'
    default:
      return ativo ? 'trabalhando' : 'parado'
  }
}

/** Sprite do estado no quadro `q` (qualquer inteiro; a animacao se repete). */
export function robo(estado: Estado, q: number): Sprite {
  const n = Math.abs(Math.trunc(q))
  switch (estado) {
    case 'trabalhando': {
      const grade = anel('gray', true)
      const cabeca = n % ANEL.length
      // Rastro: duas bolinhas atras da cabeca, na cor mas apagadas; a cabeca acesa.
      for (const [atras, apagada] of [
        [2, true],
        [1, true],
        [0, false],
      ] as const) {
        const [r, c] = ANEL[(cabeca - atras + ANEL.length) % ANEL.length] as readonly [number, number]
        ;(grade[r] as Celula[])[c] = BOLA(LARANJA, apagada)
      }
      return { grade, cor: LARANJA, etiqueta: `${GIRO[n % GIRO.length]} trabalhando` }
    }
    case 'esperando': {
      // Pisca alternando os cantos e as laterais.
      const grade = anel('gray', true)
      ANEL.forEach(([r, c], i) => {
        if (i % 2 === n % 2) (grade[r] as Celula[])[c] = BOLA('yellow', false)
      })
      return { grade, cor: 'yellow', etiqueta: 'esperando' }
    }
    case 'feliz':
      return { grade: anel('green', false, '✓ '), cor: 'green', etiqueta: 'concluído' }
    case 'falhou':
      return { grade: anel('red', false, '✗ '), cor: 'red', etiqueta: 'falhou' }
    default:
      return { grade: anel('gray', true), cor: 'gray', etiqueta: `${['z', 'zZ', 'zZz', 'Zz'][n % 4]} parado` }
  }
}
