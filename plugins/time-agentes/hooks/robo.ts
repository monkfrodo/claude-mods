// O mascote do Claude Code no painel: 3 linhas de blocos, com as pernas alternando
// enquanto trabalha, cinza e com "zZ" quando parado.

export type Estado = 'trabalhando' | 'parado' | 'feliz' | 'falhou' | 'esperando'

export type Sprite = {
  /** As 3 linhas do corpo, todas com a mesma largura. */
  linhas: [string, string, string]
  cor: string
  /** Texto curto ao lado do nome: o que ele esta fazendo. */
  etiqueta: string
}

const CABECA = ' ▐▛███▜▌ '
const CORPO = '▝▜█████▛▘'
const PERNAS_A = '  ▘▘ ▝▝  '
const PERNAS_B = '  ▝▝ ▘▘  '
const LARANJA = '#D97757'
const GIRO = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

/** Estado do robo pelo status do agente; `ativo` e para o principal, que nao tem status. */
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
    case 'trabalhando':
      return {
        linhas: [CABECA, CORPO, n % 2 === 0 ? PERNAS_A : PERNAS_B],
        cor: LARANJA,
        etiqueta: `${GIRO[n % GIRO.length]} trabalhando`,
      }
    case 'esperando':
      return { linhas: [CABECA, CORPO, PERNAS_A], cor: 'yellow', etiqueta: n % 4 < 2 ? '? esperando' : '  esperando' }
    case 'feliz':
      return { linhas: [CABECA, CORPO, n % 2 === 0 ? PERNAS_A : PERNAS_B], cor: LARANJA, etiqueta: '✓ concluído' }
    case 'falhou':
      return { linhas: [CABECA, CORPO, PERNAS_A], cor: 'red', etiqueta: '✗ falhou' }
    default:
      return { linhas: [CABECA, CORPO, PERNAS_A], cor: 'gray', etiqueta: `${['z', 'zZ', 'zZz', 'Zz'][n % 4]} parado` }
  }
}
