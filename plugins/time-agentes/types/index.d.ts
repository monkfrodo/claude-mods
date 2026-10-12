/** O que o painel sabe de um agente; a chave e o id do agente ("main" e o principal). */
export type Entrada = { tokens: number; model?: string; nome?: string; status?: string }
export type Registro = Record<string, Entrada>

declare module 'claude-code' {
  interface PluginState {
    'time-agentes': {
      registro: Registro
      limite5h: number | null
      /** Quadro da animacao dos robos; sobe a cada passo enquanto alguem trabalha. */
      quadro: number
      /** True entre o inicio e o fim de um turno do agente principal. */
      principalAtivo: boolean
    }
  }
}
