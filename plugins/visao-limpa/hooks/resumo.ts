// Funcoes puras da visao-limpa: resumo de uma linha do resultado de uma ferramenta.

const MAX = 80

const cortar = (s: string): string => (s.length <= MAX ? s : `${s.slice(0, MAX - 1)}…`)

/** Numero de linhas nao vazias de `s`. */
const linhas = (s: string): number => s.split('\n').filter(l => l.trim() !== '').length

/** Texto curto que descreve `output` (Bash tem stdout/stderr; o resto cai no JSON). */
export function resumir(tool: string, output: unknown): string {
  if (typeof output === 'string') return `${tool}: ${linhas(output)} linhas`
  if (output && typeof output === 'object') {
    const o = output as Record<string, unknown>
    if (typeof o.stdout === 'string' || typeof o.stderr === 'string') {
      const out = typeof o.stdout === 'string' ? linhas(o.stdout) : 0
      const err = typeof o.stderr === 'string' ? linhas(o.stderr) : 0
      return `${tool}: ${out} linhas de saída${err ? `, ${err} de erro` : ''}`
    }
    try {
      return cortar(`${tool}: ${JSON.stringify(output)}`)
    } catch {
      // cai no nome da ferramenta
    }
  }
  return tool
}
