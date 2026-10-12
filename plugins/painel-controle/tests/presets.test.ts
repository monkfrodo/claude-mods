import { describe, expect, test } from 'claude-code/testing'

import { PERFIS, acharPerfil } from '../hooks/presets'

describe('acharPerfil', () => {
  test('pelo id', () => {
    expect(acharPerfil('codigo')?.model).toBe('claude-opus-5-5')
    expect(acharPerfil(' CODIGO ')?.id).toBe('codigo')
  })

  test('pelo numero', () => {
    expect(acharPerfil('1')).toBe(PERFIS[0])
    expect(acharPerfil(String(PERFIS.length))).toBe(PERFIS[PERFIS.length - 1])
  })

  test('desconhecido ou vazio', () => {
    expect(acharPerfil('')).toBeUndefined()
    expect(acharPerfil('0')).toBeUndefined()
    expect(acharPerfil('nada')).toBeUndefined()
  })
})
