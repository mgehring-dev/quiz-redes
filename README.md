# Quiz Redes

Quiz no estilo Duolingo com as perguntas da Lista de Exercícios 2 (Redes de Computadores: Aplicação e Transporte).
Mesma organização do GVcrm-Frontend: `src/app/pages`, `shared/services/api`, hooks com `react-query`.

## Rodar

```
npm install
npm run dev
```

Abre em http://localhost:3010. No VS Code: `Ctrl+Shift+B` (tarefa `dev`) ou F5 (abre o Chrome com debug).

Atalhos no jogo: `1`–`4` escolhe a opção, `Enter` verifica / continua.

## Publicado

https://quiz-redes-six.vercel.app

### Deploy automático

O projeto da Vercel está ligado a este repositório:

| Branch | Ambiente | Endereço |
| --- | --- | --- |
| `main` | Produção | https://quiz-redes-six.vercel.app |
| `dev` | Dev | https://quiz-redes-dev.vercel.app |
| qualquer outra / pull request | Prévia | link próprio gerado pela Vercel (aparece no PR e no commit) |

Fluxo sugerido: trabalhe na `dev`, confira em quiz-redes-dev, e quando estiver bom faça o merge da `dev` na `main` para ir para produção:

```
git switch dev
# ...alterações...
git add -A && git commit -m "mensagem" && git push        # → atualiza o ambiente de dev
git switch main && git merge dev && git push               # → atualiza produção
```

Fora da produção aparece uma faixa no topo do site: **DEV** (branch dev), **PRÉVIA · branch** (outras) ou **LOCAL** (sua máquina).

**Ver que está subindo**

- No GitHub, ao lado do commit aparece uma bolinha: 🟡 construindo, ✅ publicado, ❌ falhou (clique nela para ver o log).
- Pelo terminal: `npx.cmd vercel@latest ls` lista os deploys e o estado de cada um (Building, Ready, Error).
- No painel: vercel.com → projeto **quiz-redes** → **Deployments**.

**Ter certeza de que subiu**

- Abra https://quiz-redes-six.vercel.app/version.json — mostra o `commit`, a `branch`, a mensagem e a data do build que está no ar. Compare com `git log -1 --format=%h`.
- No site com `?admin`, o rodapé do menu de configurações mostra "Versão abc1234 · data".
- No console do navegador (F12) aparece `Quiz Redes · versão abc1234 (production)`.

Deploy manual (só se precisar): `npx.cmd vercel@latest deploy --prod --yes` (no PowerShell).

Admin, enquanto não há login: abra o site com `?admin` (ex.: `https://quiz-redes-six.vercel.app/?admin`). Sem `?admin` no endereço, é sempre visitante (nada fica lembrado).
Sem backend, as configurações ficam salvas só no navegador de quem alterou.

## API

Sem backend, as chamadas são respondidas pelo mock em `src/app/shared/mocks` (adapter do axios, com latência).
Para apontar para a API real, em `.env.development`:

```
REACT_APP_USE_MOCK=false
REACT_APP_API_URL=http://localhost:5000/api
```

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/quiz/perguntas` | — | `IQuestion[]` (sem gabarito; `tipo`: unica, multipla ou ordenar) |
| GET | `/quiz/perguntas/:id/explicacao` | — | `{ porQue, conceito[], alternativas[], dica }` |
| POST | `/quiz/respostas` | `{ idPergunta, idOpcoes[] }` | `{ correta, idOpcoesCorretas[], explicacao, xpGanho, xpTotal }` |
| GET | `/quiz/perfil` | — | `{ xpTotal, respostas, acertos }` |
| DELETE | `/quiz/perfil` | — | 204 |

Os tipos estão em `src/app/shared/services/api/quiz/index.ts`.
