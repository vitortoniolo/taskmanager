# Task Manager - Organizador de Tarefas

Um organizador de tarefas simples e prático para gerenciar projetos e suas atividades de forma colaborativa.

## 📋 Sobre o Projeto

**Task Manager** é uma aplicação desenvolvida para a disciplina **Programação Full Stack**. Permite que usuários criem projetos, organizem tarefas e colaborem com outros membros de forma intuitiva e eficiente.

## 🎯 Funcionalidades

- ✅ **Autenticação**: Registro e login com JWT
- ✅ **Gestão de Usuários**: Criar, atualizar e deletar perfis
- ✅ **Projetos Colaborativos**: Criar projetos e adicionar membros
- ✅ **Organização de Tarefas**: Criar, editar e acompanhar tarefas (TODO → DOING → DONE)
- ✅ **Atribuição**: Designar tarefas a membros do projeto

## 🛠️ Tecnologias Utilizadas

- **Backend**: [NestJS](https://nestjs.com/) - Framework TypeScript moderno e escalável
- **Banco de Dados**: PostgreSQL - SGBD robusto e confiável
- **ORM**: TypeORM - Mapeamento objeto-relacional TypeScript
- **Autenticação**: JWT (JSON Web Tokens) - Segurança de endpoints
- **Validação**: Class Validator - Validação de DTOs
- **Testes**: Jest - Framework de testes unitários e E2E

## 🚀 Como Começar

### Pré-requisitos
- Node.js v18+
- PostgreSQL instalado
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone <seu-repositorio>

# Instalar dependências
npm install

# Configurar banco de dados (.env)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=seu_usuario
DATABASE_PASSWORD=sua_senha
DATABASE_NAME=task_manager
JWT_SECRET=sua_chave_secreta

# Executar migrations
npm run typeorm migration:run

# Popular dados iniciais (opcional)
npm run seed

# Iniciar o servidor
npm start
```

### Desenvolvimento

```bash
# Modo watch (hot-reload)
npm run start:dev

# Rodar testes
npm run test

# Testes E2E
npm run test:e2e
```

## 📚 Documentação

- **[Endpoints API](./endpoints.md)** - Lista completa de endpoints disponíveis

## 📊 Estrutura do Projeto

```
src/
├── auth/              # Autenticação e JWT
├── users/             # Gerenciamento de usuários
├── projects/          # Gerenciamento de projetos
├── tasks/             # Gerenciamento de tarefas
├── database/          # Configurações e seeds
└── common/            # Guards, decorators, exceptions
```

## 🔐 Autenticação

A API utiliza **JWT (Bearer Token)** para autenticação. Os endpoints de login e registro são públicos. Os demais endpoints requerem o token no header:

```
Authorization: Bearer seu_token_jwt
```

## 💡 Exemplos de Uso

Para exemplos completos de requisições, consulte [endpoints.md](./endpoints.md) ou importe a coleção do Insomnia disponível no projeto.

## 📝 Licença

Projeto acadêmico - Disciplina Programação Full Stack


