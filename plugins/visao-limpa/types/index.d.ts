/** Ids (tool_use_id) dos resultados que o usuario abriu com o botao "ver". */
export type Abertos = string[]

declare module 'claude-code' {
  interface PluginState {
    'visao-limpa': { abertos: Abertos }
  }
}
