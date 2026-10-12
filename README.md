# claude-mods

Marketplace de plugins do Claude Code de monkfrodo.

## dia-santo

Faixa discreta, sempre acima do prompt (terminal e aba Code do app desktop), com a data de hoje em America/Sao_Paulo, o dia da semana e o santo do dia:

```
quarta-feira, 7 de outubro de 2026 · Nossa Senhora do Rosário
```

Funciona sem rede: o santo vem de uma tabela embutida (`plugins/dia-santo/hooks/santos.ts`, uma entrada por dia, 02-29 incluído). A data é conferida a cada 5 minutos, então a faixa vira sozinha à meia-noite.

## Outros mods

Baseados nos mods do vídeo do Rafa Voz. Todos funcionam no Claude Code (terminal e aba Code do app), não no chat nem no Cowork.

| Mod | O que faz | Como usar |
| --- | --- | --- |
| `barra-creditos` | Barra acima do prompt com o que **resta** dos limites de 5h e 7 dias e o custo da sessão | automático |
| `visao-limpa` | Grupos de ferramentas dobrados e resultados em uma linha; o botão **ver** mostra o detalhe | automático |
| `painel-controle` | Escolhe modelo e esforço por tarefa (edição de vídeo, automação, código...) | `/painel`, `/painel <id\|número>`, `/painel off` |
| `time-agentes` | Cada tipo de subagente roda no modelo da tabela; painel com barra de consumo por agente e total | `/agentes` |
| `corrida` | Minijogo de corrida num painel, para esperar o Claude trabalhar | `/corrida` |

Para ajustar: os perfis do painel ficam em `plugins/painel-controle/hooks/presets.ts` e os modelos por subagente em `plugins/time-agentes/hooks/time.ts`.

### Instalar

No prompt de uma sessão do Claude Code (precisa da versão 2.1.287 ou mais nova):

```
/plugin marketplace add monkfrodo/claude-mods
/plugin install dia-santo@claude-mods
/plugin install barra-creditos@claude-mods
/plugin install visao-limpa@claude-mods
/plugin install painel-controle@claude-mods
/plugin install time-agentes@claude-mods
/plugin install corrida@claude-mods
```

Repita nos dois computadores. Escolha o escopo de usuário para valer em todos os projetos.

### Atualizar

```
claude plugin marketplace update claude-mods
claude plugin update <mod>@claude-mods
```

Depois, `/reload-plugins` na sessão aberta (ou abra uma sessão nova).

### Desenvolver

```
claude --plugin-dir plugins/<mod>
claude plugin validate plugins/<mod>
claude plugin validate .
claude plugin test plugins/<mod>
```
