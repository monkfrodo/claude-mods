// Perfis do painel: uma tarefa, o melhor modelo e o melhor esforco para ela.
// Edite esta lista para ajustar ao seu dia a dia.

export type Esforco = 'low' | 'medium' | 'high' | 'xhigh' | 'max'
export type Perfil = { id: string; nome: string; model: string; effort: Esforco }

export const PERFIS: readonly Perfil[] = [
  { id: 'rapido', nome: 'Rápido (perguntas simples)', model: 'claude-haiku-5-5', effort: 'low' },
  { id: 'automacao', nome: 'Automação do dia a dia', model: 'claude-sonnet-5-5', effort: 'medium' },
  { id: 'edicao-video', nome: 'Edição de vídeo', model: 'claude-sonnet-5-5', effort: 'high' },
  { id: 'codigo', nome: 'Código e projetos', model: 'claude-opus-5-5', effort: 'high' },
  { id: 'dificil', nome: 'Problema difícil', model: 'claude-opus-5-5', effort: 'max' },
]

/** Perfil pelo id, ou pelo numero (1, 2, ...) da lista. */
export function acharPerfil(texto: string): Perfil | undefined {
  const t = texto.trim().toLowerCase()
  if (!t) return undefined
  const n = Number(t)
  if (Number.isInteger(n) && n >= 1 && n <= PERFIS.length) return PERFIS[n - 1]
  return PERFIS.find(p => p.id === t)
}
