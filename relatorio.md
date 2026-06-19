# Relatório Técnico — Task Manager

**Disciplina:** Programação Full Stack  
**Projeto:** Task Manager — API REST para Gerenciamento Colaborativo de Tarefas

---

## 1. Introdução

Este relatório descreve o desenvolvimento do **Task Manager**, uma API REST construída para a disciplina de Programação Full Stack. A aplicação tem como objetivo central permitir que equipes organizem suas tarefas de forma simples, colaborativa e rastreável, por meio de uma interface de programação bem definida e segura.

O sistema foi desenvolvido utilizando **NestJS** como framework principal, **TypeScript** como linguagem, **PostgreSQL** como banco de dados relacional e **TypeORM** como camada de mapeamento objeto-relacional. A autenticação é realizada via **JSON Web Tokens (JWT)**.

O presente documento descreve o problema que motivou a aplicação, a solução implementada com seus requisitos e funcionalidades, a arquitetura de software adotada com suas decisões técnicas, as ferramentas utilizadas e as considerações finais sobre o trabalho.

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
| Qualquer equipe pode usar, independente do tipo de projeto | Generalidade da solução |

---

## 3. Solução

### 3.1 Descrição Geral da Aplicação

O Task Manager é uma **API REST** organizada em quatro domínios funcionais:

- **Autenticação (Auth):** registro e login de usuários, emissão e validação de tokens JWT;
- **Usuários (Users):** gerenciamento de perfis de usuário;
- **Projetos (Projects):** criação e gerenciamento de projetos colaborativos com controle de membros;
- **Tarefas (Tasks):** criação, atribuição e acompanhamento de tarefas dentro dos projetos.

A API expõe **18 endpoints** documentados em `endpoints.md`, todos protegidos por autenticação JWT, exceto os endpoints públicos de registro e login.

### 3.2 Requisitos Funcionais

| ID | Descrição |
|----|-----------|
| RF01 | O sistema deve permitir que um novo usuário se registre informando nome, e-mail e senha |
| RF02 | O sistema deve autenticar o usuário via e-mail e senha, retornando um token JWT |
| RF03 | Um usuário autenticado pode criar projetos |
| RF04 | O criador do projeto é automaticamente adicionado como membro |
| RF05 | Membros podem adicionar e remover outros usuários do projeto |
| RF06 | Apenas membros do projeto podem visualizar seus dados e tarefas |
| RF07 | Membros podem criar tarefas vinculadas ao projeto |
| RF08 | O responsável pela tarefa (assignee) deve obrigatoriamente ser membro do projeto |
| RF09 | O status das tarefas segue uma máquina de estados: `TODO → DOING → DONE` |
| RF10 | A exclusão de um projeto deve remover automaticamente todas as suas tarefas |
| RF11 | A exclusão de um usuário deve anular sua atribuição em tarefas, sem excluí-las |

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
| Validação de transição de estados | Método `validateTaskStatusTransition()` com lógica de máquina de estados |
| Controle de acesso por membro | Verificação `project.users.some(u => u.id === userId)` nos services |
| Validação de campos dos DTOs | Decorators `@IsString()`, `@IsEmail()`, `@IsUUID()` do `class-validator` |

**Exemplo da máquina de estados** (independente de qualquer framework):

```typescript
// src/tasks/tasks.service.ts
private validateTaskStatusTransition(current: TaskStatus, next: TaskStatus) {
  const valid: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.TODO]:  [TaskStatus.TODO, TaskStatus.DOING],
    [TaskStatus.DOING]: [TaskStatus.DOING, TaskStatus.DONE],
    [TaskStatus.DONE]:  [TaskStatus.DONE],
  };
  if (!valid[current].includes(next)) {
    throw new BadRequestException(`Cannot transition from ${current} to ${next}`);
  }
}
```

Essa lógica poderia ser extraída e reutilizada em qualquer outro ambiente Node.js sem qualquer adaptação.

---

## 4. Arquitetura do Sistema

### 4.1 Arquitetura Adotada

O projeto utiliza **Arquitetura em Camadas (Layered Architecture)** combinada com **Arquitetura Modular**, padrão natural do NestJS.

#### Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────┐
│  Camada de Apresentação — Controllers               │
│  Recebe requisições HTTP, valida autenticação,      │
│  delega ao service e retorna a resposta             │
├─────────────────────────────────────────────────────┤
│  Camada de Negócio — Services                       │
│  Aplica regras de negócio: controle de membros,     │
│  máquina de estados, validações de domínio          │
├─────────────────────────────────────────────────────┤
│  Camada de Acesso a Dados — Repositories (TypeORM)  │
│  Executa queries, persiste entidades,               │
│  gerencia relacionamentos                           │
├─────────────────────────────────────────────────────┤
│  Banco de Dados — PostgreSQL                        │
└─────────────────────────────────────────────────────┘
```

**Exemplos concretos por camada:**

- **Controller:** `TasksController.create()` em `src/tasks/tasks.controller.ts` extrai o `userId` do token JWT (`req.user.id`) e repassa ao service — nenhuma lógica de negócio aqui.
- **Service:** `TasksService.create()` em `src/tasks/tasks.service.ts` verifica se o usuário é membro do projeto, se o assignee também é membro, e só então persiste a tarefa.
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

Módulos se comunicam exclusivamente via `exports`/`imports` declarativos no `@Module()`. Por exemplo, `AuthModule` exporta `AuthService` para que `JwtStrategy` possa validar usuários durante a autenticação.

### 4.2 Modelagem de Domínio

#### Entidades

**User** (`src/users/entities/user.entity.ts`)

| Campo | Tipo | Restrição |
|-------|------|-----------|
| id | UUID | PK, gerado automaticamente |
| name | varchar(255) | obrigatório |
| email | varchar(255) | obrigatório, único |
| password | varchar | obrigatório, excluído das respostas (`@Exclude()`) |
| createdAt | timestamp | gerado automaticamente |
| updatedAt | timestamp | atualizado automaticamente |

**Project** (`src/projects/entities/project.entity.ts`)

| Campo | Tipo | Restrição |
|-------|------|-----------|
| id | UUID | PK, gerado automaticamente |
| name | varchar(255) | obrigatório |
| description | text | opcional (nullable) |
| createdAt | timestamp | gerado automaticamente |
| updatedAt | timestamp | atualizado automaticamente |

**Task** (`src/tasks/entities/task.entity.ts`)

| Campo | Tipo | Restrição |
|-------|------|-----------|
| id | UUID | PK, gerado automaticamente |
| title | varchar(255) | obrigatório |
| description | text | opcional (nullable) |
| status | enum | `TODO` \| `DOING` \| `DONE`, padrão: `TODO` |
| projectId | UUID | FK → Project, obrigatório |
| assigneeId | UUID | FK → User, opcional (nullable) |
| createdAt | timestamp | gerado automaticamente |
| updatedAt | timestamp | atualizado automaticamente |

#### Relacionamentos

```
User ────────────────────── Project
 │   ManyToMany (JoinTable)    │
 │                             │ OneToMany (cascade delete)
 │                             │
 │        ManyToOne            ▼
 └──── (assignee, nullable) ── Task
```

- **User ↔ Project (ManyToMany):** Um usuário pode ser membro de vários projetos; um projeto pode ter vários membros. A tabela de junção é gerenciada automaticamente pelo TypeORM via `@JoinTable()` declarado na entidade `Project`.

- **Project → Task (OneToMany com cascade):** Um projeto contém muitas tarefas. A relação tem `cascade: true`, de modo que ao excluir um projeto, todas as suas tarefas são removidas automaticamente pelo banco de dados (`onDelete: 'CASCADE'` na FK).

- **User → Task — assignee (ManyToOne, nullable):** Uma tarefa pode ser atribuída a um usuário (membro do projeto). A relação é opcional; ao excluir o usuário, a FK é anulada (`onDelete: 'SET NULL'`), preservando a tarefa no sistema.

#### Diagrama Entidade-Relacionamento

```
┌──────────────┐        ┌─────────────────────┐        ┌──────────────┐
│    users     │        │  project_users_user  │        │   projects   │
│──────────────│        │─────────────────────│        │──────────────│
│ id (PK, UUID)│◄──────►│ userId (FK)         │◄──────►│ id (PK, UUID)│
│ name         │        │ projectId (FK)       │        │ name         │
│ email        │        └─────────────────────┘        │ description  │
│ password     │                                        │ createdAt    │
│ createdAt    │                                        │ updatedAt    │
│ updatedAt    │                                        └──────┬───────┘
└──────┬───────┘                                               │ 1
       │ 1                                                     │
       │ (SET NULL)                                            │ N (CASCADE)
       │ N                                                     │
       │                                              ┌────────▼─────────┐
       └──────────────────────────────────────────────┤      tasks       │
                          assignee (nullable)          │──────────────────│
                                                       │ id (PK, UUID)    │
                                                       │ title            │
                                                       │ description      │
                                                       │ status (enum)    │
                                                       │ projectId (FK)   │
                                                       │ assigneeId (FK?) │
                                                       │ createdAt        │
                                                       │ updatedAt        │
                                                       └──────────────────┘
```

### 4.3 Segurança e Autorização

**Autenticação via JWT:**
- Token Bearer assinado com `JWT_SECRET` (variável de ambiente), expiração de 7 dias (604.800 segundos)
- Fluxo: login → `JwtService.sign(payload)` → cliente envia `Authorization: Bearer <token>` → `JwtStrategy` valida e popula `req.user`

**Proteção de senhas:**
- Hashing com `bcrypt` usando 10 rounds de salt, tornando ataques de força bruta computacionalmente inviáveis
- O campo `password` é marcado com `@Exclude()` na entidade, garantindo que nunca seja serializado nas respostas da API

**Autorização por membros (Row-Level Security nos services):**
- Antes de qualquer leitura ou escrita em projetos e tarefas, o service verifica se o usuário autenticado é membro do projeto correspondente
- Acessos não autorizados resultam em `ForbiddenException` (HTTP 403)

**Validação de entrada:**
- `ValidationPipe` global com `whitelist: true` (ignora campos não declarados no DTO) e `forbidNonWhitelisted: true` (rejeita requisições com campos extras), prevenindo injeção de dados inesperados

### 4.4 Decisões Técnicas Justificadas

| Decisão | Justificativa |
|---------|---------------|
| `synchronize: true` no TypeORM | Ambiente acadêmico/desenvolvimento: sincroniza o schema automaticamente com as entidades, eliminando a necessidade de migrations manuais |
| UUIDs como chave primária | Evita a enumeração sequencial de recursos (ex: `/tasks/1`, `/tasks/2`), aumentando a segurança da API |
| Hard delete (sem soft delete) | Adequado para o escopo do projeto; simplifica queries e o modelo de dados sem perda de funcionalidade relevante |
| `CreateTaskDto` e `UpdateTaskDto` sem herança `PartialType` | `UpdateTaskDto` contém o campo `status` (inexistente no create) e não contém `projectId` (imutável após criação), tornando a herança inadequada |
| Verificação de membro via `.some()` nos services | Lógica de autorização explícita e testável, sem dependência de middlewares ou decorators adicionais |
| Cascade delete em `Project → Task` | Garante consistência referencial: não existem tarefas órfãs sem projeto |
| SET NULL em `User → Task` (assignee) | Preserva o histórico de tarefas mesmo após a saída de um membro, mantendo a integridade dos dados do projeto |

---

## 5. Ferramentas Utilizadas

### NestJS v11
Framework Node.js progressivo e modular, construído sobre TypeScript e Express. Provê um sistema de injeção de dependências nativo, decorators para definição de controllers, guards, módulos e pipes. Foi a espinha dorsal da aplicação, organizando o código em módulos independentes e coesos.

### TypeScript 5.7
Superset tipado do JavaScript que adiciona verificação de tipos estáticos, enums, decorators e inferência de tipos. Fundamental para a utilização do TypeORM e do NestJS, além de garantir maior segurança e clareza no código da aplicação.

### PostgreSQL
Sistema gerenciador de banco de dados relacional open source, utilizado para persistência dos dados. Suporta nativamente tipos UUID, colunas do tipo `enum`, chaves estrangeiras com comportamentos de `CASCADE` e `SET NULL`, e transações ACID.

### TypeORM v0.3
ORM (Object-Relational Mapper) para TypeScript/Node.js. Permite mapear entidades TypeScript para tabelas do banco de dados via decorators, definir relacionamentos, executar queries com o `QueryBuilder` e operar com repositórios tipados. Utilizado para toda a camada de persistência da aplicação.

### bcrypt v6
Biblioteca para hashing seguro de senhas. Implementa o algoritmo Bcrypt com salt rounds configuráveis, tornando ataques de dicionário e força bruta computacionalmente inviáveis. Utilizado no registro e na atualização de senhas de usuários.

### JWT — @nestjs/jwt + passport-jwt
Implementação de autenticação stateless via JSON Web Tokens. O `@nestjs/jwt` assina e verifica tokens; o `passport-jwt` extrai o token do header `Authorization: Bearer` e integra com o sistema de guards do NestJS. Utilizado para proteger todos os endpoints autenticados.

### class-validator / class-transformer
Bibliotecas para validação declarativa de objetos via decorators. O `class-validator` verifica campos (`@IsString()`, `@IsEmail()`, `@IsUUID()`, `@IsEnum()`, etc.) e o `class-transformer` converte plain objects em instâncias de classes. Utilizados em todos os DTOs da aplicação.

### Jest v30
Framework de testes unitários para JavaScript/TypeScript. Configurado no projeto com suporte a `ts-jest` para execução direta de arquivos TypeScript. A estrutura de testes está preparada para expansão futura.

### ts-node
Executor de TypeScript para Node.js sem necessidade de compilação prévia. Utilizado especificamente para executar o script de seed do banco de dados (`npm run seed`), que popula o ambiente com dados iniciais para desenvolvimento e testes.

### IAs utilizadas

_(a preencher manualmente)_

---

## 6. Considerações Finais

O **Task Manager** cumpre seu objetivo principal: oferecer uma API REST funcional, segura e bem estruturada para o gerenciamento colaborativo de tarefas. O projeto demonstra, na prática, conceitos centrais do desenvolvimento full stack moderno — autenticação stateless, controle de acesso baseado em membros, modelagem relacional e organização de código em camadas e módulos.

A escolha da Arquitetura em Camadas mostrou-se adequada ao porte do projeto. A separação entre controllers (responsáveis pela interface HTTP), services (responsáveis pelas regras de negócio) e repositories (responsáveis pela persistência) torna o código legível, manutenível e fácil de estender. A implementação da máquina de estados para o ciclo de vida das tarefas (`TODO → DOING → DONE`) exemplifica como regras de negócio podem ser expressas de forma explícita e independente do framework.

O projeto também evidencia a distinção entre funcionalidades que dependem do framework — como roteamento, guards e injeção de dependências — e aquelas que são lógica pura, como o controle de transição de estados e a verificação de membros nos services. Essa separação é relevante tanto do ponto de vista de manutenção quanto de testabilidade.

Como principal limitação, o projeto ainda não conta com testes automatizados implementados. A suíte Jest está configurada, mas os casos de teste não foram escritos — o que representa uma área de melhoria natural para consolidar a confiabilidade da aplicação.

O próximo passo prioritário é o **desenvolvimento do frontend**, que consumirá esta API REST e trará a experiência completa ao usuário final: uma interface visual para criação e acompanhamento de projetos e tarefas, visualização do progresso da equipe em tempo real e gerenciamento de membros de forma intuitiva. A API está pronta e documentada (`endpoints.md`) para receber esse cliente.
