/** O que o painel sabe de um agente; a chave e o id do agente ("main" e o principal). */
export type Entrada = { tokens: number; model?: string; nome?: string; status?: string }
export type Registro = Record<string, Entrada>

declare module 'claude-code' {
  interface PluginState {
    'time-agentes': { registro: Registro; limite5h: number | null }
  }
}
