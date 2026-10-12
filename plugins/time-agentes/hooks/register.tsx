import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Registro } from '../types'
import { estadoDoStatus, robo } from './robo'
import { barra, compacto, corDaFatia, modeloDoTipo, totalTokens } from './time'

const PAINEL = 'time-agentes'
const REFRESH_MS = 2000
const QUADRO_MS = 600
// Passos seguidos sem ninguem trabalhando antes de a animacao parar.
const OCIOSOS_PARA_PARAR = 4

const registro = atom({ plugin: 'time-agentes', key: 'registro' } as const, {} as Registro)
const quadro = atom({ plugin: 'time-agentes', key: 'quadro' } as const, 0)
const principalAtivo = atom({ plugin: 'time-agentes', key: 'principalAtivo' } as const, false)
const limite5h = atom({ plugin: 'time-agentes', key: 'limite5h' } as const, null as number | null)

// Atualiza nomes/status dos agentes e o limite de 5h; falha so deixa como estava.
async function atualizar($: EngineInterface): Promise<void> {
  try {
    const lista = await $.agent.list()
    await update($, registro, r => {
      const novo: Registro = { ...r }
      for (const a of lista) {
        novo[a.id] = { ...novo[a.id], tokens: novo[a.id]?.tokens ?? 0, nome: a.name ?? a.description ?? a.type, status: a.status }
      }
      return novo
    })
    const u = await $.session.usage()
    const h5 = u.rateLimits.find(l => l.kind === 'five_hour')
    await update($, limite5h, () => (h5 ? h5.percentUsed : null))
  } catch {
    // nunca propagar
  }
}

type Animacao = { timer?: { cancel: () => void }; ociosos: number }

/** Avanca o quadro; para o timer depois de alguns passos sem ninguem trabalhando. */
async function girar($: EngineInterface, anim: Animacao): Promise<void> {
  try {
    await update($, quadro, q => q + 1)
    const reg = await read($, registro)
    const trabalhando =
      (await read($, principalAtivo)) || Object.values(reg).some(a => a.status === 'running')
    anim.ociosos = trabalhando ? 0 : anim.ociosos + 1
    if (anim.ociosos >= OCIOSOS_PARA_PARAR) {
      anim.timer?.cancel()
      anim.timer = undefined
    }
  } catch {
    // nunca propagar
  }
}

/** Liga a animacao se estiver parada. */
function acordar($: EngineInterface, anim: Animacao): void {
  anim.ociosos = 0
  if (anim.timer) return
  try {
    anim.timer = $.clock.every(QUADRO_MS, () => {
      void girar($, anim)
    })
  } catch {
    // sem timer: os robos ficam parados
  }
}

export const register: Register = on => {
  let timer: { cancel: () => void } | undefined
  const anim: Animacao = { ociosos: 0 }

  on('session.start', async ($, e, next) => {
    try {
      await $.command.register({ name: 'agentes', description: 'Painel do time de agentes e do consumo' })
      timer?.cancel()
      timer = $.clock.every(REFRESH_MS, () => {
        void atualizar($)
      })
    } catch {
      // sem o comando/timer: o painel so mostra o que ja registrou
    }
    // Abre sozinho (a partir de 144 colunas; abaixo disso espera ate caber).
    void $.ui.open({ id: PAINEL, title: 'Time de agentes' })
    return next(e)
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'agentes' }, async $ => {
    await atualizar($)
    acordar($, anim)
    await $.ui.open({ id: PAINEL, title: 'Time de agentes' })
    return { text: 'Painel de agentes aberto.' }
  })

  on('turn.start', async ($, e, next) => {
    try {
      await update($, principalAtivo, () => true)
      acordar($, anim)
    } catch {
      // nunca propagar
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    try {
      if (e.agentId === undefined) await update($, principalAtivo, () => false)
    } catch {
      // nunca propagar
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  // Cada subagente roda no modelo da tabela (a menos que a chamada ja tenha pedido um).
  on('agent.spawn', async ($, e, next) => {
    const model = modeloDoTipo(e.subagentType, e.model)
    const r = await next(model && model !== e.model ? { ...e, model } : e)
    acordar($, anim)
    try {
      if ('agentId' in r && r.agentId) {
        const id = r.agentId
        await update($, registro, reg => ({
          ...reg,
          [id]: { ...reg[id], tokens: reg[id]?.tokens ?? 0, model: r.model, nome: e.description || e.subagentType },
        }))
      }
    } catch {
      // nunca propagar
    }
    return r
  }).catch(($, e, next) => next(e))

  // Consumo por agente: tokens de cada resposta, somados na chave do agente.
  on('turn.step', async function* ($, e, next) {
    const r = yield* next(e)
    try {
      const u = r.usage
      if (u) {
        const chave = e.agentId ?? 'main'
        const gasto = u.input_tokens + u.output_tokens
        await update($, registro, reg => ({
          ...reg,
          [chave]: { ...reg[chave], tokens: (reg[chave]?.tokens ?? 0) + gasto, model: u.model },
        }))
      }
    } catch {
      // nunca propagar
    }
    return r
  })

  on('ui.render', { component: 'Pane', requestId: PAINEL }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const reg = await read($, registro)
    const h5 = await read($, limite5h)
    const q = await read($, quadro)
    const principalOn = await read($, principalAtivo)
    const total = totalTokens(reg)
    const ids = Object.keys(reg)
    const maior = Math.max(1, ...ids.map(id => reg[id]?.tokens ?? 0))

    return (
      <Box flexDirection="column" borderStyle="round" borderColor="magenta" paddingX={1}>
        <Box gap={1}>
          <Text bold color="magenta">
            Total
          </Text>
          <Text color="cyan">{barra(total, Math.max(total, 1))}</Text>
          <Text>{compacto(total)} tokens</Text>
        </Box>
        {h5 !== null && (
          <Box gap={1}>
            <Text bold>Limite 5h</Text>
            <Text color={corDaFatia(h5, 100)}>{barra(h5, 100)}</Text>
            <Text>{Math.round(h5)}% usado</Text>
          </Box>
        )}
        {ids.length === 0 && <Text dimColor>Nenhum agente ainda.</Text>}
        {ids.map(id => {
          const a = reg[id]
          if (!a) return null
          const sp = robo(estadoDoStatus(a.status, id === 'main' && principalOn), q + id.length)
          return (
            <Box key={id} gap={2}>
              <Box flexDirection="column">
                {sp.linhas.map((linha, i) => (
                  <Text key={`r${i}`} color={sp.cor}>
                    {linha}
                  </Text>
                ))}
              </Box>
              <Box flexDirection="column">
                <Box gap={1}>
                  <Text bold={id === 'main'}>{id === 'main' ? 'principal' : (a.nome ?? id)}</Text>
                  <Text color={sp.cor}>{sp.etiqueta}</Text>
                </Box>
                <Box gap={1}>
                  <Text color={corDaFatia(a.tokens, Math.max(total, 1))}>{barra(a.tokens, maior)}</Text>
                  <Text>{compacto(a.tokens)}</Text>
                </Box>
                <Text dimColor>{a.model ?? ' '}</Text>
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  })
}
