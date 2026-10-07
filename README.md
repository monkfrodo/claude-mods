# claude-mods

Marketplace de plugins do Claude Code de monkfrodo.

## dia-santo

Faixa discreta, sempre acima do prompt (terminal e aba Code do app desktop), com a data de hoje em America/Sao_Paulo, o dia da semana e o santo do dia:

```
quarta-feira, 7 de outubro de 2026 · Nossa Senhora do Rosário
```

Funciona sem rede: o santo vem de uma tabela embutida (`plugins/dia-santo/hooks/santos.ts`, uma entrada por dia, 02-29 incluído). A data é conferida a cada 5 minutos, então a faixa vira sozinha à meia-noite.

### Instalar

No prompt de uma sessão do Claude Code no terminal:

```
/plugin install dia-santo --marketplace monkfrodo/claude-mods
```

Responda `y` para adicionar o marketplace e escolha o escopo de usuário (Enter). Ou, em dois passos:

```
/plugin marketplace add monkfrodo/claude-mods
/plugin install dia-santo@claude-mods
```

### Atualizar

```
claude plugin marketplace update claude-mods
claude plugin update dia-santo@claude-mods
```

Depois, `/reload-plugins` na sessão aberta (ou abra uma sessão nova).

### Desenvolver

```
claude --plugin-dir plugins/dia-santo
claude plugin validate plugins/dia-santo
claude plugin validate .
claude plugin test plugins/dia-santo
```
