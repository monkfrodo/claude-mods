import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { PerfilAtivo } from '../types'
import { PERFIS, acharPerfil } from './presets'

const PAINEL = 'painel-controle'
const ativo = atom({ plugin: 'painel-controle', key: 'ativo' } as const, null as PerfilAtivo)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    try {
      await $.command.register({
        name: 'painel',
        description: 'Escolhe modelo e esforço por tarefa (/painel, /painel <id|número>, /painel off)',
      })
    } catch {
      // sem o comando: o painel nao abre
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'painel' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'off') {
      await update($, ativo, () => null)
      return { text: 'Painel desligado: valem o modelo e o esforço da sessão.' }
    }
    const perfil = acharPerfil(arg)
    if (perfil) {
      await update($, ativo, () => perfil.id)
      return { text: `Perfil **${perfil.nome}**: ${perfil.model}, esforço ${perfil.effort}.` }
    }
    await $.ui.open({ id: PAINEL, title: 'Painel de controle' })
    return { text: 'Painel aberto.' }
  })

  // So o modelo principal: subagentes seguem o time-agentes (ou o padrao).
  on('turn.step', async function* ($, e, next) {
    if (e.agentId !== undefined) return yield* next(e)
    let escolhido
    try {
      const id = await read($, ativo)
      escolhido = PERFIS.find(p => p.id === id)
    } catch {
      // sem leitura: segue com o da sessao
    }
    if (!escolhido) return yield* next(e)
    return yield* next({ ...e, model: escolhido.model, effort: escolhido.effort })
  })

  on('ui.render', { component: 'Pane', requestId: PAINEL }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const id = await read($, ativo)
    return (
      <Box flexDirection="column">
        <Text bold>Tarefa → modelo e esforço</Text>
        {PERFIS.map(p => (
          <Box key={p.id}>
            <Button
              key={`btn-${p.id}`}
              label={`${p.id === id ? '●' : '○'} ${p.nome}`}
              onPress={() => update($, ativo, () => p.id)}
            />
            <Text dimColor> {p.model} · {p.effort}</Text>
          </Box>
        ))}
        <Button key="off" label={id === null ? '● Padrão da sessão' : '○ Padrão da sessão'} onPress={() => update($, ativo, () => null)} />
      </Box>
    )
  })
}
