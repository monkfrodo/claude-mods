import { describe, expect, test } from 'claude-code/testing'

import { descrever, resumir } from '../hooks/resumo'

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

describe('descrever', () => {
  test('prefere a descricao da chamada', () => {
    expect(descrever('Bash', { description: 'Lista a pasta', command: 'ls -la' })).toBe('Bash · Lista a pasta')
  })

  test('cai no alvo e corta comando longo em uma linha', () => {
    expect(descrever('Read', { file_path: '/a/b.ts' })).toBe('Read · /a/b.ts')
    const longo = descrever('Bash', { command: `ls\n${'x'.repeat(200)}` })
    expect(longo.includes('\n')).toBe(false)
    expect(longo.length).toBeLessThanOrEqual('Bash · '.length + 70)
  })

  test('sem entrada conhecida: so o nome', () => {
    expect(descrever('Edit', undefined)).toBe('Edit')
    expect(descrever('Edit', { x: 1 })).toBe('Edit')
  })
})
