import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Registro } from '../types'
import { barra, compacto, corDaFatia, iconeStatus, modeloDoTipo, totalTokens } from './time'

const PAINEL = 'time-agentes'
const REFRESH_MS = 2000

const registro = atom({ plugin: 'time-agentes', key: 'registro' } as const, {} as Registro)
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

export const register: Register = on => {
  let timer: { cancel: () => void } | undefined

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
    return next(e)
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'agentes' }, async $ => {
    await atualizar($)
    await $.ui.open({ id: PAINEL, title: 'Time de agentes' })
    return { text: 'Painel de agentes aberto.' }
  })

  // Cada subagente roda no modelo da tabela (a menos que a chamada ja tenha pedido um).
  on('agent.spawn', async ($, e, next) => {
    const model = modeloDoTipo(e.subagentType, e.model)
    const r = await next(model && model !== e.model ? { ...e, model } : e)
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
          const st = iconeStatus(a.status)
          return (
            <Box key={id} gap={1}>
              <Text color={st.cor}>{st.icone}</Text>
              <Text bold={id === 'main'}>{(id === 'main' ? 'principal' : (a.nome ?? id)).padEnd(16).slice(0, 16)}</Text>
              <Text color={corDaFatia(a.tokens, Math.max(total, 1))}>{barra(a.tokens, maior)}</Text>
              <Text>{compacto(a.tokens)}</Text>
              <Text dimColor>{a.model ?? ''}</Text>
            </Box>
          )
        })}
      </Box>
    )
  })
}
