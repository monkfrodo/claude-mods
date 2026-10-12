import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Abertos } from '../types'
import { descrever, resumir } from './resumo'

const abertos = atom({ plugin: 'visao-limpa', key: 'abertos' } as const, [] as Abertos)

export const register: Register = on => {
  // Grupos de leitura/busca sempre dobrados em uma linha de contagem.
  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    try {
      return next({ ...e, props: { ...e.props, isExpanded: false } })
    } catch {
      return next(e)
    }
  }).catch(($, e, next) => next(e))

  // Chamada de ferramenta: uma linha com o que esta sendo feito; "ver" mostra o comando inteiro.
  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    try {
      const id = e.props.tool_use_id
      if ((await read($, abertos)).includes(id)) return next(e)

      const { Box, Button, Text } = $.ui.resolve(e)
      const marca = e.props.isErrored ? '✗' : e.props.isRunning ? '…' : '✓'
      return (
        <Box key={`visao-limpa-uso-${id}`}>
          <Text dimColor>
            {marca} {descrever(e.props.tool, e.props.input)}{' '}
          </Text>
          <Button
            key={`ver-uso-${id}`}
            label="ver"
            onPress={() => update($, abertos, list => (list.includes(id) ? list : [...list, id].slice(-500)))}
          />
        </Box>
      )
    } catch {
      return next(e)
    }
  }).catch(($, e, next) => next(e))

  // Resultado de uma ferramenta: uma linha e um botao; ao clicar, o detalhe original.
  on('ui.render', { component: 'ToolResult' }, async ($, e, next) => {
    try {
      if (e.props.isErrored) return next(e)
      const id = e.props.tool_use_id
      if ((await read($, abertos)).includes(id)) return next(e)

      const { Box, Button, Text } = $.ui.resolve(e)
      return (
        <Box key={`visao-limpa-${id}`}>
          <Text dimColor>↳ {resumir(e.props.tool, e.props.output)} </Text>
          <Button
            key={`ver-${id}`}
            label="ver"
            onPress={() => update($, abertos, list => (list.includes(id) ? list : [...list, id].slice(-500)))}
          />
        </Box>
      )
    } catch {
      return next(e)
    }
  }).catch(($, e, next) => next(e))
}
