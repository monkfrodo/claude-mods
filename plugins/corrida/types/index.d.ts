export type Obstaculo = { faixa: number; y: number }
export type Jogo = {
  carro: number
  obstaculos: Obstaculo[]
  pontos: number
  recorde: number
  vivo: boolean
  seed: number
}

declare module 'claude-code' {
  interface PluginState {
    corrida: { jogo: Jogo }
  }
}
