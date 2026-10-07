/** Data do dia em America/Sao_Paulo (AAAA-MM-DD); null antes da primeira leitura. */
export type DiaSantoHoje = string | null

declare module 'claude-code' {
  interface PluginState {
    'dia-santo': { hoje: DiaSantoHoje }
  }
}
