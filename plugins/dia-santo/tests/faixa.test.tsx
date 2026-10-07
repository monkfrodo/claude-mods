import { describe, expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

// 2026-10-08 02:30 UTC = 2026-10-07 23:30 em Sao Paulo (quarta-feira)
const NOITE_UTC = Date.UTC(2026, 9, 8, 2, 30)
const MINUTO = 60 * 1000

const BAND = {
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 120,
    scroll: { offset: 0, bodyRows: 9 },
    view: {},
  },
} as const

const HOJE = 'quarta-feira, 7 de outubro de 2026 · Nossa Senhora do Rosário'
const AMANHA = 'quinta-feira, 8 de outubro de 2026 · São Simeão, o Justo'

type Achador = { findAll: (q: { type: string }) => Promise<{ text: string }[]> }
const textos = async (ui: Achador) => (await ui.findAll({ type: 'Text' })).map(t => t.text)

/** Engine abaixo do plugin: relogio, sessao e a faixa do engine. */
function mundo(on: On) {
  const clock = mock.clock(on, { now: NOITE_UTC })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('ui.render', ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box key="engine">
        <Text>engine</Text>
      </Box>
    )
  })
  return clock
}

describe('faixa', () => {
  test('mostra data e santo em terminal e desktop', async ($, on) => {
    mundo(on)
    await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'dia-santo', surface, ...BAND })
      expect(await ui.find({ key: 'dia-santo' })).toBeDefined()
      expect(await textos(ui)).toEqual([HOJE])
      await ui.unmount()
    }
  })

  test('largura curta corta o santo numa linha so', async ($, on) => {
    mundo(on)
    await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({
        plugin: 'dia-santo',
        surface,
        ...BAND,
        props: { ...BAND.props, bodyColumns: 45 },
      })
      expect(await textos(ui)).toEqual(['quarta-feira, 7 de outubro de 2026 · Nossa S…'])
      await ui.unmount()
    }
  })

  test('sem session.start (instalado no meio da sessao) tambem aparece', async ($, on) => {
    mundo(on)
    const ui = await $.ui.mount({ plugin: 'dia-santo', surface: 'terminal', ...BAND })
    expect(await textos(ui)).toEqual([HOJE])
  })

  test('virada do dia em Sao Paulo atualiza pelo relogio', async ($, on) => {
    const clock = mundo(on)
    await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
    const ui = await $.ui.mount({ plugin: 'dia-santo', surface: 'terminal', ...BAND })
    expect(await textos(ui)).toEqual([HOJE])
    await clock.advance(35 * MINUTO) // 23:30 -> 00:05 em Sao Paulo
    expect(await textos(ui)).toEqual([AMANHA])
  })

  test('cede a vez a uma pesquisa', async ($, on) => {
    mundo(on)
    await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
    const ui = await $.ui.mount({
      plugin: 'dia-santo',
      surface: 'terminal',
      ...BAND,
      props: { ...BAND.props, hasSurvey: true },
    })
    expect(await ui.find({ key: 'dia-santo' })).toBeUndefined()
    expect(await ui.find({ key: 'engine' })).toBeDefined()
  })

  test('outras superficies: passa para o engine', async ($, on) => {
    mundo(on)
    await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
    for (const surface of ['mobile', 'vscode'] as const) {
      const ui = await $.ui.mount({ plugin: 'dia-santo', surface, ...BAND })
      expect(await ui.find({ key: 'dia-santo' })).toBeUndefined()
      await ui.unmount()
    }
  })

  test('erro no relogio: a faixa nao aparece e o engine desenha', async ($, on) => {
    on('clock.now', () => {
      throw new Error('relogio quebrado')
    })
    on('clock.every', () => {
      throw new Error('relogio quebrado')
    })
    on('session.start', ($, e) => ({ cwd: e.cwd }))
    on('ui.render', ($, e) => {
      const { Box, Text } = $.ui.resolve(e)
      return (
        <Box key="engine">
          <Text>engine</Text>
        </Box>
      )
    })
    await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
    const ui = await $.ui.mount({ plugin: 'dia-santo', surface: 'terminal', ...BAND })
    expect(await ui.find({ key: 'dia-santo' })).toBeUndefined()
    expect(await ui.find({ key: 'engine' })).toBeDefined()
  })
})
