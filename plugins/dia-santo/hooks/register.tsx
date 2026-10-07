import type { EngineInterface, Register } from 'claude-code'

import { dataSaoPaulo, montarFaixa } from './data'

// Data do dia (AAAA-MM-DD) em America/Sao_Paulo; o texto sai dela no render.
const HOJE = { plugin: 'dia-santo', key: 'hoje' } as const

// Confere a virada do dia a cada 5 minutos; o render so le o estado.
const INTERVALO_MS = 5 * 60 * 1000

type Timer = { cancel: () => void }

/** Grava a data de hoje se mudou; qualquer falha so deixa o estado como esta. */
async function atualizar($: EngineInterface): Promise<void> {
  try {
    const hoje = dataSaoPaulo(await $.clock.now())
    const { value } = await $.state.get(HOJE)
    if (value === hoje) return
    await $.state.set(HOJE, hoje)
  } catch {
    // nunca propagar: a faixa so deixa de mudar
  }
}

/** (Re)inicia a conferencia periodica da data, guardando o timer em `relogio`. */
async function iniciar($: EngineInterface, relogio: { timer?: Timer }): Promise<void> {
  relogio.timer?.cancel()
  relogio.timer = undefined
  await atualizar($)
  relogio.timer = $.clock.every(INTERVALO_MS, () => {
    void atualizar($)
  })
}

export const register: Register = on => {
  const relogio: { timer?: Timer } = {}

  on('session.start', async ($, e, next) => {
    try {
      await iniciar($, relogio)
    } catch {
      // segue sem a faixa
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.surface !== 'terminal' && e.surface !== 'desktop') return next(e)
    if (e.props.hasSurvey) return next(e)

    try {
      let { value: hoje } = await $.state.get(HOJE)
      if (!hoje) {
        // Instalado no meio da sessao (sem session.start): calcula agora e
        // tenta ligar a conferencia periodica, uma vez.
        hoje = dataSaoPaulo(await $.clock.now())
        if (!relogio.timer) {
          try {
            await iniciar($, relogio)
          } catch {
            // fica com a data calculada agora
          }
        }
      }

      const linha = montarFaixa(hoje, Math.max(10, e.props.bodyColumns))
      const { Box, Text } = $.ui.resolve(e)
      return (
        <Box key="dia-santo">
          <Text dimColor wrap="truncate-end">
            {linha}
          </Text>
        </Box>
      )
    } catch {
      return next(e)
    }
  }).catch(($, e, next) => next(e))
}
