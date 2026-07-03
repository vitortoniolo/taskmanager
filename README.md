# Task Manager - Organizador de Tarefas

Um organizador de tarefas simples e prático para gerenciar projetos e suas atividades de forma colaborativa.

## 📋 Sobre o Projeto

**Task Manager** é uma aplicação desenvolvida para a disciplina **Programação Full Stack**. Permite que usuários criem projetos, organizem tarefas e colaborem com outros membros de forma intuitiva e eficiente.

## 🎯 Funcionalidades

- ✅ **Autenticação**: Registro e login com JWT
- ✅ **Perfil**: Editar nome/senha e excluir a própria conta
- ✅ **Projetos Colaborativos**: Criar, editar e excluir projetos; adicionar e remover membros
- ✅ **Quadro de Tarefas**: Colunas A fazer / Em progresso / Concluído, com movimentação livre entre status
- ✅ **Edição de Cards**: Clicar em uma tarefa abre o modal para editar título, descrição completa, status e responsável
- ✅ **Minhas Tarefas**: Visão com todas as tarefas atribuídas a você, em todos os projetos

## 🛠️ Tecnologias Utilizadas

- **Backend**: [NestJS](https://nestjs.com/) - Framework TypeScript moderno e escalável
- **Frontend**: [React](https://react.dev/) + [Vite](https://vite.dev/) + [Tailwind CSS](https://tailwindcss.com/) - Interface SPA (ver [`frontend/`](./frontend))
- **Banco de Dados**: PostgreSQL - Persistencia de dados entre execuções
- **ORM**: TypeORM - Mapeamento objeto-relacional TypeScript
- **Autenticação**: JWT (JSON Web Tokens) - Segurança de endpoints
- **Validação**: Class Validator - Validação de DTOs

## 🚀 Como Rodar o Projeto

O projeto tem duas partes: o **backend** (API NestJS, pasta raiz) e o **frontend** (React, pasta [`frontend/`](./frontend)). Rode cada um em um terminal separado.

### Pré-requisitos
- **Node.js** v18 ou superior
- **PostgreSQL** instalado e rodando

### Passo 1 — Preparar o banco de dados

O banco precisa existir. Como o TypeORM está com `synchronize: true`, as tabelas são criadas automaticamente na primeira execução, você só cria o database vazio uma vez:

```bash
psql -U postgres -p 5433 -c "CREATE DATABASE task_manager;"
```

As credenciais de conexão ficam no arquivo `.env` (na raiz). Valores padrão:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=4229
DB_NAME=task_manager
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=604800
```

> Ajuste `DB_PORT`, `DB_USER` e `DB_PASSWORD` conforme a sua instalação do PostgreSQL.

### Passo 2 — Backend (Terminal 1)

```bash
# a partir da pasta raiz do projeto (taskmanager/)
npm install          # instala as dependências
npm run seed         # opcional: popula usuários, projetos e tarefas de exemplo
npm run start:dev    # inicia a API em http://localhost:3000 (com hot-reload)
```

> O `npm run seed` é recomendado: cria dados de teste para você já ver projetos e tarefas no frontend. Sem ele, o login funciona mas o app começa vazio.

### Passo 3 — Frontend (Terminal 2)

```bash
cd frontend
npm install          # instala as dependências 
npm run dev          # inicia a interface em http://localhost:5173
```

### Passo 4 — Usar

1. Abra **http://localhost:5173** no navegador
2. Clique em **Cadastre-se** para criar uma conta (ou use as credenciais do seed, se rodou o `npm run seed`)
3. Crie projetos, adicione membros e gerencie as tarefas no quadro — os cards podem ser movidos livremente entre **A fazer / Em progresso / Concluído**, e clicar em um card abre a edição completa

> O frontend faz proxy de `/api` para `http://localhost:3000`, então **os dois precisam estar rodando ao mesmo tempo**.

## 📚 Documentação

- **[Endpoints API](./endpoints.md)** - Lista completa de endpoints disponíveis
- **[Relatório Técnico](./relatorio.md)** - Problema, solução, arquitetura e decisões do projeto

## 📊 Estrutura do Projeto

```
taskmanager/
├── src/               # Backend (API NestJS)
│   ├── auth/          # Autenticação, JWT e guard das rotas
│   ├── users/         # Gerenciamento de usuários
│   ├── projects/      # Gerenciamento de projetos
│   ├── tasks/         # Gerenciamento de tarefas
│   └── database/      # Seed de dados de exemplo
└── frontend/          # Frontend (React + Vite + Tailwind)
    └── src/
        ├── pages/     # Login, Cadastro, Dashboard, Detalhe do projeto, Minhas tarefas
        ├── components/# UI reutilizável (Layout, TaskCard, Modal, formulários)
        ├── api/       # Cliente HTTP e chamadas à API
        └── context/   # Estado de autenticação
```

## 🔐 Autenticação

A API utiliza **JWT (Bearer Token)** para autenticação. Os endpoints de login e registro são públicos. Os demais endpoints requerem o token no header:

```
Authorization: Bearer seu_token_jwt
```

## 💡 Exemplos de Uso

Para exemplos completos de requisições, consulte [endpoints.md](./endpoints.md).


## 📝 Licença

Projeto acadêmico - Disciplina Programação Full Stack


