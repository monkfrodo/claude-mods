import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Limite } from '../types'
import { montarLinha } from './barra'

const limites = atom({ plugin: 'barra-creditos', key: 'limites' } as const, [] as Limite[])
const custo = atom({ plugin: 'barra-creditos', key: 'custo' } as const, null as number | null)

export const register: Register = on => {
  // Leitura inicial, para a barra aparecer antes da primeira medicao.
  on('session.start', async ($, e, next) => {
    try {
      const u = await $.session.usage()
      await update($, limites, () => u.rateLimits.map(l => ({ kind: l.kind, percentUsed: l.percentUsed })))
      await update($, custo, () => u.cost?.usd ?? null)
    } catch {
      // sem leitura: a barra so aparece na primeira medicao
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('session.measure', async ($, e, next) => {
    try {
      await update($, limites, () => e.rateLimits.map(l => ({ kind: l.kind, percentUsed: l.percentUsed })))
      await update($, custo, () => e.cost?.usd ?? null)
    } catch {
      // nunca propagar
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.surface !== 'terminal' && e.surface !== 'desktop') return next(e)
    if (e.props.hasSurvey) return next(e)
    try {
      const linha = montarLinha(await read($, limites), await read($, custo))
      if (!linha) return next(e)
      const { Box, Text } = $.ui.resolve(e)
      return (
        <Box key="barra-creditos">
          <Text wrap="truncate-end">{linha}</Text>
        </Box>
      )
    } catch {
      return next(e)
    }
  }).catch(($, e, next) => next(e))
}
