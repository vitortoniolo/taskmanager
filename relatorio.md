# Relatório Técnico — Task Manager

## Aplicação Full Stack para Gerenciamento Colaborativo de Tarefas

**Disciplina:** Programação Full Stack
**Autores:** _(preencher nomes dos integrantes)_
**Turma:** _(preencher turma)_

---

## 1. Introdução

Este relatório descreve o desenvolvimento do **Task Manager**, uma aplicação full stack construída para a disciplina de Programação Full Stack. A aplicação tem como objetivo central permitir que equipes organizem suas tarefas de forma simples, colaborativa e rastreável, por meio de um quadro visual de tarefas apoiado por uma API REST bem definida e segura.

O sistema é composto por duas partes: um **backend** desenvolvido com **NestJS**, **TypeScript**, **PostgreSQL** e **TypeORM**, com autenticação via **JSON Web Tokens (JWT)**; e um **frontend SPA** desenvolvido com **React**, **Vite** e **Tailwind CSS**, que consome a API e oferece a experiência completa ao usuário final — do login ao acompanhamento do quadro de tarefas.

O presente documento descreve o problema que motivou a aplicação, a solução implementada com seus requisitos, funcionalidades e soluções de segurança e performance, a arquitetura de software adotada com o modelo de renderização e as decisões técnicas, as ferramentas utilizadas e as considerações finais sobre o trabalho.

---

## 2. Problema

Equipes de qualquer porte e escopo — seja um projeto acadêmico, uma startup ou um time corporativo — enfrentam um desafio comum: manter a organização das tarefas de forma simples, clara e acessível a todos os envolvidos.

Sem uma ferramenta centralizada, surgem problemas práticos:

- Tarefas se perdem em conversas de mensagens ou planilhas desatualizadas;
- Não há clareza sobre quem é responsável por cada atividade;
- O progresso do trabalho é invisível para a equipe como um todo;
- Não há separação entre projetos distintos, misturando responsabilidades.

A necessidade identificada é simples e direta: uma ferramenta que permita a qualquer equipe criar projetos, registrar tarefas dentro deles, atribuí-las a membros e acompanhar o progresso — sem complexidade desnecessária.

A solução não precisa ser sofisticada; precisa ser objetiva: **quem faz o quê, em qual projeto, e em que estado está**.

### Requisitos derivados do problema

| Requisito | Origem |
|-----------|--------|
| Cada pessoa possui conta própria e acessa apenas o que lhe pertence | Isolamento e privacidade |
| Projetos agrupam tarefas e membros | Organização por contexto |
| Tarefas têm responsável designado e estado de progresso rastreável | Visibilidade e responsabilidade |
| O estado das tarefas pode ser corrigido livremente (ex.: reabrir uma tarefa concluída) | Flexibilidade do fluxo real de trabalho |
| Qualquer equipe pode usar, independente do tipo de projeto | Generalidade da solução |

---

## 3. Solução

### 3.1 Descrição Geral da Aplicação

O Task Manager é uma aplicação **full stack** composta por uma API REST e uma interface web SPA, organizada em quatro domínios funcionais:

- **Autenticação (Auth):** registro e login de usuários, emissão e validação de tokens JWT;
- **Usuários (Users):** gerenciamento de perfis — edição de nome/senha e exclusão de conta;
- **Projetos (Projects):** criação, edição e exclusão de projetos colaborativos com controle de membros;
- **Tarefas (Tasks):** criação, edição completa, atribuição e acompanhamento de tarefas em um quadro por status.

A API expõe **18 endpoints** documentados em `endpoints.md`, todos protegidos por autenticação JWT, exceto os endpoints públicos de registro e login. O frontend oferece representação visual para todas as operações da API: quadro de tarefas por status, modal de edição de card (aberto ao clicar na tarefa), painel de membros, página "Minhas tarefas" e modal de perfil.

### 3.2 Requisitos Funcionais

| ID | Descrição |
|----|-----------|
| RF01 | O sistema deve permitir que um novo usuário se registre informando nome, e-mail e senha |
| RF02 | O sistema deve autenticar o usuário via e-mail e senha, retornando um token JWT |
| RF03 | Um usuário autenticado pode criar, editar e excluir projetos |
| RF04 | O criador do projeto é automaticamente adicionado como membro |
| RF05 | Membros podem adicionar e remover outros usuários do projeto |
| RF06 | Apenas membros do projeto podem visualizar seus dados e tarefas |
| RF07 | Membros podem criar tarefas vinculadas ao projeto |
| RF08 | O responsável pela tarefa (assignee) deve obrigatoriamente ser membro do projeto |
| RF09 | Tarefas possuem status `TODO`, `DOING` ou `DONE` e podem transitar **livremente** entre eles |
| RF10 | Ao clicar em um card, o usuário pode editar título, descrição completa, status e responsável |
| RF11 | O usuário pode visualizar todas as tarefas atribuídas a ele, em todos os projetos |
| RF12 | O usuário pode editar seu perfil (nome e senha) e excluir a própria conta |
| RF13 | A exclusão de um projeto deve remover automaticamente todas as suas tarefas |
| RF14 | A exclusão de um usuário deve anular sua atribuição em tarefas, sem excluí-las |


### 3.3 Funcionalidades Dependentes do Framework (NestJS)

Parte das funcionalidades da aplicação dependem diretamente das abstrações providas pelo NestJS:

| Funcionalidade | Mecanismo NestJS |
|---|---|
| Roteamento HTTP e mapeamento de endpoints | `@Controller()`, `@Get()`, `@Post()`, `@Patch()`, `@Delete()` |
| Injeção de dependências entre classes | `@Injectable()` + construtor com parâmetros tipados |
| Proteção de rotas autenticadas | `@UseGuards(JwtGuard)` + `AuthGuard('jwt')` via `@nestjs/passport` |
| Validação automática de entradas | `ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true` |
| Isolamento de funcionalidades em módulos | `@Module()` com declarações de `imports`, `providers`, `controllers`, `exports` |
| Integração com o repositório TypeORM | `@InjectRepository()` para injeção do `Repository<Entity>` |
| Leitura de variáveis de ambiente com tipagem | `ConfigService` do `@nestjs/config` |
| DTOs com herança parcial | `PartialType()` do `@nestjs/mapped-types` para UpdateDTOs |

**Exemplo:** o guard de autenticação é declarativo e não requer código adicional no controller:

```typescript
// src/tasks/tasks.controller.ts
@Controller('tasks')
@UseGuards(JwtGuard)   // protege todos os endpoints da classe de uma vez
export class TasksController { ... }
```

### 3.4 Funcionalidades Independentes do Framework

Outras funcionalidades existem como lógica pura, sem acoplamento ao NestJS:

| Funcionalidade | Implementação |
|---|---|
| Hashing e verificação de senhas | `bcrypt.hash()` / `bcrypt.compare()` — biblioteca independente |
| Definição do ciclo de vida da tarefa | `enum TaskStatus { TODO, DOING, DONE }` — TypeScript puro |
| Controle de acesso por membro | Helpers `getProjectAsMember()` e `getAssignee()` nos services |
| Remoção de responsável da tarefa | `assigneeId: null` no update limpa a FK e a relação carregada |
| Validação de campos dos DTOs | Decorators `@IsString()`, `@IsEmail()`, `@IsUUID()` do `class-validator` |

**Exemplo do controle de acesso por membro** (independente de qualquer framework):

```typescript
// src/tasks/tasks.service.ts — helper chamado antes de qualquer leitura ou escrita
private async getProjectAsMember(projectId: string, userId: string) {
  const project = await this.projectsRepository.findOne({
    where: { id: projectId },
    relations: ['users'],
  });

  if (!project) {
    throw new NotFoundException('Project not found');
  }
  if (!project.users.some((u) => u.id === userId)) {
    throw new ForbiddenException('You do not have access to this project');
  }

  return project;
}
```

Essa lógica poderia ser extraída e reutilizada em qualquer outro ambiente Node.js sem qualquer adaptação.

### 3.5 Soluções de Segurança

1. **Hashing de senhas com bcrypt:** senhas nunca são armazenadas em texto plano — `bcrypt` com 10 rounds de salt torna ataques de dicionário e força bruta computacionalmente inviáveis. O campo `password` é ainda marcado com `@Exclude()` na entidade, garantindo que nunca seja serializado nas respostas da API.

2. **Autenticação stateless via JWT:** token Bearer assinado com `JWT_SECRET` (variável de ambiente), expiração de 7 dias. Fluxo: login → `JwtService.sign(payload)` → cliente envia `Authorization: Bearer <token>` → `JwtStrategy` valida e popula `req.user`. No frontend, o token é injetado automaticamente pelo cliente HTTP (`api/client.ts`).

3. **Autorização por membros (row-level nos services):** antes de qualquer leitura ou escrita em projetos e tarefas, o service verifica se o usuário autenticado é membro do projeto correspondente. Acessos não autorizados resultam em `ForbiddenException` (HTTP 403).

4. **Validação e saneamento de entrada:** `ValidationPipe` global com `whitelist: true` (descarta campos não declarados no DTO) e `forbidNonWhitelisted: true` (rejeita requisições com campos extras), prevenindo mass assignment e injeção de dados inesperados. UUIDs validados com `ParseUUIDPipe` nas rotas.

5. **Identificadores não sequenciais (UUID):** todas as chaves primárias são UUIDs gerados aleatoriamente, impedindo a enumeração de recursos por tentativa (ex.: iterar `/tasks/1`, `/tasks/2`...). Combinado com a autorização por membros, dificulta ataques de referência insegura a objetos (IDOR).

### 3.6 Soluções de Performance

1. **Carregamento de relações em query única:** os services usam `relations: ['project', 'assignee']` do TypeORM para trazer entidade e relacionamentos em um único `JOIN`, evitando o problema de N+1 queries. Somado à autenticação stateless via JWT (validada em memória, sem consulta de sessão), cada requisição toca o banco o mínimo necessário.

2. **Build otimizado do frontend:** o Vite gera bundle de produção com tree-shaking e minificação (~60 kB gzip), servido como arquivos estáticos. Por ser uma SPA, a navegação entre páginas não recarrega o documento — apenas os dados necessários são buscados na API, com re-renderização reativa apenas dos componentes afetados.

---

## 4. Arquitetura do Sistema

### 4.1 Arquitetura Adotada

O projeto utiliza **Arquitetura em Camadas (Layered Architecture)** combinada com **Arquitetura Modular** no backend, e uma **SPA em componentes** no frontend.

#### Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────┐
│  Frontend — SPA React (Vite + Tailwind)              │
│  Páginas, componentes e cliente HTTP; consome a      │
│  API via fetch com token JWT                         │
├─────────────────────────────────────────────────────┤
│  Camada de Apresentação — Controllers                │
│  Recebe requisições HTTP, valida autenticação,       │
│  delega ao service e retorna a resposta              │
├─────────────────────────────────────────────────────┤
│  Camada de Negócio — Services                        │
│  Aplica regras de negócio: controle de membros,      │
│  validações de domínio, atribuição de responsáveis   │
├─────────────────────────────────────────────────────┤
│  Camada de Acesso a Dados — Repositories (TypeORM)   │
│  Executa queries, persiste entidades,                │
│  gerencia relacionamentos                            │
├─────────────────────────────────────────────────────┤
│  Banco de Dados — PostgreSQL                         │
└─────────────────────────────────────────────────────┘
```

**Exemplos concretos por camada:**

- **Frontend:** `ProjectDetail.tsx` renderiza o quadro por status e abre o modal de edição ao clicar em um card; `api/endpoints.ts` centraliza todas as chamadas à API.
- **Controller:** `TasksController.update()` extrai o `userId` do token JWT (`req.user.id`) e repassa ao service — nenhuma lógica de negócio aqui.
- **Service:** `TasksService.update()` verifica se o usuário é membro do projeto e se o novo responsável também é, e só então persiste a alteração.
- **Repository:** `this.tasksRepository.save(task)` persiste a entidade sem conhecer as regras de negócio que a geraram.

#### Arquitetura Modular

Cada domínio é encapsulado em um módulo NestJS independente:

```
AppModule
├── AuthModule     → AuthController, AuthService, JwtStrategy
├── UsersModule    → UsersController, UsersService
├── ProjectsModule → ProjectsController, ProjectsService
└── TasksModule    → TasksController, TasksService
```

Módulos se comunicam exclusivamente via `exports`/`imports` declarativos no `@Module()`. No frontend, a organização espelha essa separação: `pages/` (Dashboard, ProjectDetail, MyTasks, Login, Register), `components/` (TaskCard, Modal, Layout, ui), `context/` (AuthContext) e `api/` (client, endpoints).

### 4.2 Modelo de Renderização

O frontend adota **Client-Side Rendering (CSR)** no formato **SPA (Single-Page Application)**:

- O servidor entrega apenas um HTML mínimo e o bundle JavaScript; o React constrói e atualiza toda a interface no navegador;
- A navegação entre rotas (`react-router-dom`) troca componentes sem recarregar a página;
- Os dados chegam sob demanda via `fetch` à API REST, e a tela é re-renderizada de forma reativa a partir do estado.

CSR é adequado ao caso: a aplicação é inteiramente autenticada (atrás de login), o que torna SEO e renderização no servidor (SSR) irrelevantes — a prioridade é a interatividade do quadro de tarefas, com atualizações rápidas após cada ação (mover card, editar, atribuir responsável).

### 4.3 Modelagem de Domínio

**User** (`src/users/entities/user.entity.ts`)

| Campo | Tipo | Restrição |
|-------|------|-----------|
| id | UUID | PK, gerado automaticamente |
| name | varchar(255) | obrigatório |
| email | varchar(255) | obrigatório, único |
| password | varchar | obrigatório, excluído das respostas (`@Exclude()`) |
| createdAt / updatedAt | timestamp | gerados automaticamente |

**Project** (`src/projects/entities/project.entity.ts`)

| Campo | Tipo | Restrição |
|-------|------|-----------|
| id | UUID | PK, gerado automaticamente |
| name | varchar(255) | obrigatório |
| description | text | opcional (nullable) |
| createdAt / updatedAt | timestamp | gerados automaticamente |

**Task** (`src/tasks/entities/task.entity.ts`)

| Campo | Tipo | Restrição |
|-------|------|-----------|
| id | UUID | PK, gerado automaticamente |
| title | varchar(255) | obrigatório |
| description | text | opcional (nullable) |
| status | enum | `TODO` \| `DOING` \| `DONE`, padrão: `TODO` |
| projectId | UUID | FK → Project, obrigatório |
| assigneeId | UUID | FK → User, opcional (nullable) |
| createdAt / updatedAt | timestamp | gerados automaticamente |

#### Relacionamentos

```
User ────────────────────── Project
 │   ManyToMany (JoinTable)    │
 │                             │ OneToMany (cascade delete)
 │                             │
 │        ManyToOne            ▼
 └──── (assignee, nullable) ── Task
```

- **User ↔ Project (ManyToMany):** um usuário pode ser membro de vários projetos; um projeto pode ter vários membros. A tabela de junção é gerenciada automaticamente pelo TypeORM via `@JoinTable()` declarado na entidade `Project`.

- **Project → Task (OneToMany com cascade):** um projeto contém muitas tarefas. Ao excluir um projeto, todas as suas tarefas são removidas automaticamente pelo banco (`onDelete: 'CASCADE'` na FK).

- **User → Task — assignee (ManyToOne, nullable):** uma tarefa pode ser atribuída a um usuário (membro do projeto). A relação é opcional; ao excluir o usuário, a FK é anulada (`onDelete: 'SET NULL'`), preservando a tarefa. O mesmo mecanismo permite **remover o responsável** de uma tarefa enviando `assigneeId: null` na edição.

### 4.4 Decisões Técnicas Justificadas

| Decisão | Justificativa |
|---------|---------------|
| `synchronize: true` no TypeORM | Ambiente acadêmico/desenvolvimento: sincroniza o schema automaticamente com as entidades, eliminando migrations manuais |
| UUIDs como chave primária | Evita a enumeração sequencial de recursos (ex: `/tasks/1`, `/tasks/2`), aumentando a segurança da API |
| Transição livre de status (remoção da máquina de estados) | A regra rígida `TODO → DOING → DONE` impedia fluxos legítimos (reabrir tarefa concluída); a flexibilidade reflete o uso real |
| `assigneeId: null` para desatribuir | Semântica REST clara no `PATCH`: string desloca o responsável, `null` o remove — sem endpoint adicional |
| Hard delete (sem soft delete) | Adequado ao escopo; simplifica queries e o modelo de dados sem perda de funcionalidade relevante |
| `CreateTaskDto` e `UpdateTaskDto` sem herança `PartialType` | `UpdateTaskDto` contém `status` (inexistente no create) e não contém `projectId` (imutável após criação) |
| Verificação de membro via `.some()` nos services | Lógica de autorização explícita e testável, sem middlewares ou decorators adicionais |
| Regras repetidas extraídas em helpers privados | `getProjectAsMember()` e `getAssignee()` concentram as checagens de membro/responsável usadas por vários métodos dos services |
| `req.user` tipado com a interface `AuthRequest` | Elimina o `any` nos controllers; o compilador passa a verificar o acesso a `req.user.id` |
| SPA com CSR no frontend | Aplicação autenticada não precisa de SSR/SEO; prioriza interatividade do quadro |
| Classes CSS nomeadas no frontend (`.card`, `.btn`, `.badge`...) | Substituem listas longas de utilitários no JSX; o Tailwind fica reservado ao layout |
| Estado global mínimo (apenas AuthContext) | Os dados de projeto/tarefas vivem no estado local das páginas e são recarregados após cada mutação — simples e sempre consistente com o servidor |

---

## 5. Ferramentas Utilizadas

### Backend

- **NestJS v11** — framework Node.js progressivo e modular sobre TypeScript e Express. Provê injeção de dependências nativa e decorators para controllers, guards, módulos e pipes. Espinha dorsal da API.
- **TypeScript 5.7** — superset tipado do JavaScript com verificação estática, enums e decorators. Fundamental para o NestJS/TypeORM e para a segurança do código.
- **PostgreSQL** — SGBD relacional open source. Suporta nativamente UUID, colunas `enum`, FKs com `CASCADE`/`SET NULL` e transações ACID.
- **TypeORM v0.3** — ORM que mapeia entidades TypeScript para tabelas via decorators, com repositórios tipados e carregamento de relações. Toda a camada de persistência.
- **ts-node / Jest v30** — execução de TypeScript sem compilação prévia (usado no seed do banco, `npm run seed`) e framework de testes configurado para expansão futura.

### Frontend

- **React 18** — biblioteca de construção de interfaces por componentes com renderização reativa a partir do estado. Base de todas as páginas e componentes da SPA.
- **React Router v6** — roteamento client-side; define as rotas protegidas (`/`, `/my-tasks`, `/projects/:id`) e as públicas (`/login`, `/register`).
- **Vite v5** — bundler e servidor de desenvolvimento. Provê HMR instantâneo, proxy para a API em desenvolvimento e build de produção otimizado (tree-shaking e minificação).
- **Tailwind CSS v4** — framework CSS utilitário. O tema dark (paleta ciano/verde) é definido com tokens em `@theme`; os padrões visuais repetidos viram classes nomeadas (`.card`, `.btn`, `.badge`) no `index.css`, deixando o JSX com utilitários apenas de layout.

### Segurança

- **bcrypt v6** — hashing seguro de senhas com salt rounds configuráveis. Usado no registro e na atualização de senha.
- **@nestjs/jwt + passport-jwt** — autenticação stateless via JWT: assinatura/verificação de tokens e extração do header `Authorization: Bearer` integrada aos guards do NestJS.
- **class-validator / class-transformer** — validação declarativa dos DTOs (`@IsString()`, `@IsEmail()`, `@IsUUID()`, `@IsEnum()`) e transformação de plain objects em instâncias tipadas.

### Performance

- **Vite (build de produção)** — bundle minificado com tree-shaking (~60 kB gzip) servido estaticamente.
- **TypeORM (relations)** — carregamento de relacionamentos via `JOIN` em query única, evitando N+1.

### IAs Utilizadas

- **Claude Code (Anthropic)** assistente de programação usado como par durante o desenvolvimento: implementação de funcionalidades, revisão da cobertura frontend↔backend e atualização da documentação. 

---

## 6. Considerações Finais

O **Task Manager** cumpre seu objetivo: oferecer uma aplicação full stack funcional, segura e bem estruturada para o gerenciamento colaborativo de tarefas. O projeto demonstra, na prática, conceitos centrais do desenvolvimento web moderno — autenticação stateless, controle de acesso baseado em membros, modelagem relacional, organização em camadas e módulos no backend e renderização client-side no frontend.

A separação entre controllers (interface HTTP), services (regras de negócio) e repositories (persistência) torna o código legível, manutenível e fácil de estender, o que ficou evidente na própria evolução do projeto: a remoção da máquina de estados de transição e a adição da edição completa de tarefas exigiram alterações localizadas, sem efeitos colaterais em outras camadas. Uma revisão posterior de simplificação reforçou essa base: regras repetidas foram extraídas para helpers nos services e os estilos repetidos para classes CSS nomeadas, sem nenhuma mudança de comportamento. No frontend, a centralização das chamadas em `api/endpoints.ts` permitiu identificar e cobrir com interface todos os endpoints do backend, incluindo edição de projeto, perfil de usuário e a visão "Minhas tarefas".

O trabalho também evidencia a distinção entre funcionalidades que dependem do framework, roteamento, guards, injeção de dependências, e aquelas que são lógica pura, como a verificação de membros nos services. Essa separação é relevante tanto para manutenção quanto para testabilidade.

Como principal limitação, o projeto ainda não conta com testes automatizados implementados. A suíte Jest está configurada, mas os casos de teste não foram escritos — área de melhoria natural para consolidar a confiabilidade da aplicação. Outras evoluções possíveis incluem arrastar e soltar (drag-and-drop) dos cards entre colunas, comentários nas tarefas e notificações de atribuição.

Como contribuição, o trabalho consolidou o ciclo completo de uma aplicação full stack: da modelagem do domínio à interface final, passando por autenticação, autorização, validação e documentação da API (`endpoints.md`) — uma base sólida e extensível para qualquer sistema colaborativo semelhante.
