import { describe, expect, test } from 'claude-code/testing'

import { resumir } from '../hooks/resumo'

describe('resumir', () => {
  test('Bash conta linhas de saida e de erro', () => {
    expect(resumir('Bash', { stdout: 'a\nb\n\nc', stderr: '' })).toBe('Bash: 3 linhas de saída')
    expect(resumir('Bash', { stdout: 'a', stderr: 'x\ny' })).toBe('Bash: 1 linhas de saída, 2 de erro')
  })

  test('texto puro conta linhas', () => {
    expect(resumir('Read', 'a\nb')).toBe('Read: 2 linhas')
  })

  test('objeto qualquer vira JSON curto', () => {
    expect(resumir('Edit', { ok: true })).toBe('Edit: {"ok":true}')
    expect(resumir('Edit', { texto: 'x'.repeat(200) }).length).toBe(80)
  })

  test('sem saida: so o nome', () => {
    expect(resumir('Edit', undefined)).toBe('Edit')
  })
})
