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

https://quiz-redes-six.vercel.app — para atualizar: `npx.cmd vercel@latest deploy --prod --yes` (no PowerShell).

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
