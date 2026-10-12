/** Id do perfil ativo (de presets.ts); null deixa o modelo e o esforço da sessão. */
export type PerfilAtivo = string | null

declare module 'claude-code' {
  interface PluginState {
    'painel-controle': { ativo: PerfilAtivo }
  }
}
