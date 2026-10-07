export type Limite = { kind: string; percentUsed: number }

declare module 'claude-code' {
  interface PluginState {
    'barra-creditos': { limites: Limite[]; custo: number | null }
  }
}
