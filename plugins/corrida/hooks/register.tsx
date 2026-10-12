import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Jogo } from '../types'
import { desenhar, mover, novo, passo } from './jogo'

const PAINEL = 'corrida'
const TICK_MS = 350

const jogo = atom({ plugin: 'corrida', key: 'jogo' } as const, novo())

export const register: Register = on => {
  let timer: { cancel: () => void } | undefined

  const parar = () => {
    timer?.cancel()
    timer = undefined
  }

  on('session.start', async ($, e, next) => {
    try {
      await $.command.register({ name: 'corrida', description: 'Minijogo de corrida num painel' })
    } catch {
      // sem o comando: o jogo nao abre
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'corrida' }, async $ => {
    parar()
    const seed = (await $.clock.now()) & 0x7fffffff
    await update($, jogo, (j: Jogo) => novo(j.recorde, seed))
    timer = $.clock.every(TICK_MS, () => {
      void update($, jogo, (j: Jogo) => passo(j)).then(async () => {
        if (!(await read($, jogo)).vivo) parar()
      })
    })
    await $.ui.open({ id: PAINEL, title: 'Corrida' })
    return { text: 'Corrida aberta. Use os botões ◀ ▶ do painel.' }
  })

  on('ui.render', { component: 'Pane', requestId: PAINEL }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const j = await read($, jogo)
    return (
      <Box flexDirection="column">
        <Text bold>
          Pontos {j.pontos} · Recorde {j.recorde}
        </Text>
        {desenhar(j).map((linha, i) => (
          <Text key={`l${i}`}>{linha}</Text>
        ))}
        <Box>
          <Button key="esq" label="◀" onPress={() => update($, jogo, (x: Jogo) => mover(x, -1))} />
          <Text> </Text>
          <Button key="dir" label="▶" onPress={() => update($, jogo, (x: Jogo) => mover(x, 1))} />
        </Box>
        {!j.vivo && <Text dimColor>Bateu! Rode /corrida para jogar de novo.</Text>}
      </Box>
    )
  })
}
