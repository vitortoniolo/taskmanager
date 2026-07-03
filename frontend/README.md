# Task Manager — Frontend (React)

Frontend **CSR/SPA** que consome a API REST do Task Manager (NestJS).

## Stack

- **Vite + React 18 + TypeScript** — modelo de renderização CSR/SPA
- **Tailwind CSS v4** — utilitários para layout; os padrões visuais repetidos viram classes nomeadas (`.card`, `.btn`, `.badge`...) no `index.css`
- **React Router v6** — navegação client-side
- **Tema dark** — paleta ciano/verde sobre slate escuro, definida com tokens em `@theme`

## Páginas

| Rota            | Página             | Descrição                                                              |
| --------------- | ------------------ | ---------------------------------------------------------------------- |
| `/login`        | Login              | Autenticação via `POST /auth/login`                                    |
| `/register`     | Cadastro           | Registro via `POST /auth/register` + login automático                  |
| `/`             | Dashboard          | Lista dos projetos do usuário; criação de novos projetos               |
| `/projects/:id` | Detalhe do projeto | Quadro de tarefas por status, edição de card em modal, membros         |
| `/my-tasks`     | Minhas tarefas     | Todas as tarefas atribuídas ao usuário, em todos os projetos           |

Também no cabeçalho: modal **Meu perfil** (editar nome/senha, excluir conta).

Rotas autenticadas são protegidas: sem token JWT válido, redireciona para `/login`.
No quadro, os cards podem ser movidos livremente entre os status, e clicar em um card
abre o modal de edição (título, descrição completa, status e responsável).

## Como rodar

> Requer o backend NestJS rodando em `http://localhost:3000`.

```bash
npm install
npm run dev
```

Acesse http://localhost:5173

O Vite faz proxy de `/api/*` → `http://localhost:3000`, evitando problemas de CORS
em desenvolvimento.

## Estrutura

```
src/
├── api/
│   ├── client.ts      # fetch + token JWT + tratamento de erros
│   └── endpoints.ts   # funções por endpoint (auth, users, projects, tasks)
├── context/
│   └── AuthContext.tsx# autenticação (login, registro, perfil, logout)
├── components/        # Layout, TaskCard, Modal e formulários (ui.tsx)
├── pages/             # Login, Register, Dashboard, ProjectDetail, MyTasks
├── types.ts           # modelos espelhando a API
├── index.css          # tema + classes de componente (.card, .btn, .badge...)
└── App.tsx            # rotas e proteção
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — typecheck + build de produção
- `npm run preview` — pré-visualiza o build
