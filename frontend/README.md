# Task Manager — Frontend (React)

Frontend **CSR/SPA** que consome a API REST do Task Manager (NestJS).

## Stack

- **Vite + React 18 + TypeScript** — modelo de renderização CSR/SPA
- **Tailwind CSS v4** — estilização utilitária
- **React Router** — navegação client-side
- **Tema dark** — paleta ciano/verde sobre slate escuro

## Páginas implementadas (validação)

| Rota         | Página      | Descrição                                                        |
| ------------ | ----------- | ---------------------------------------------------------------- |
| `/login`     | Login       | Autenticação via `POST /auth/login`                              |
| `/register`  | Cadastro    | Registro via `POST /auth/register` + login automático            |
| `/`          | Dashboard   | Cards de tarefas por status (TODO / DOING / DONE), por projeto   |

Rotas autenticadas são protegidas: sem token JWT válido, redireciona para `/login`.

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
│   ├── client.ts      # fetch + injeção de JWT + tratamento de erros
│   └── endpoints.ts   # funções por endpoint (auth, projects, tasks)
├── context/
│   └── AuthContext.tsx# estado de autenticação (token + usuário)
├── components/        # UI reutilizável (Button, Input, Layout, TaskCard)
├── pages/             # Login, Register, Dashboard
├── types.ts           # modelos espelhando a API
└── App.tsx            # rotas e proteção
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — typecheck + build de produção
- `npm run preview` — pré-visualiza o build
