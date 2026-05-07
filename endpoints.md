# 📡 Endpoints - Task Manager API

**Base URL**: `http://localhost:3000`

**Autenticação**: Todos os endpoints exceto login e registro requerem `Authorization: Bearer {token}`

---

## 🔐 Autenticação

### Registrar Usuário
```http
POST /auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "password123"
}
```
**Status**: 201 | **Resposta**: User object

### Fazer Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "password123"
}
```
**Status**: 200 | **Resposta**: `{ access_token, user }`

---

## 👥 Usuários

### Listar Todos os Usuários
```http
GET /users
Authorization: Bearer {token}
```
**Status**: 200 | **Resposta**: Array de usuários

### Obter Usuário por ID
```http
GET /users/:id
Authorization: Bearer {token}
```
**Status**: 200 | **Resposta**: User object

### Atualizar Usuário
```http
PATCH /users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Updated",
  "password": "newpassword123"
}
```
**Status**: 200 | **Resposta**: User atualizado

### Deletar Usuário
```http
DELETE /users/:id
Authorization: Bearer {token}
```
**Status**: 204 | **Resposta**: Sem conteúdo

---

## 📁 Projetos

### Criar Projeto
```http
POST /projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "E-Commerce Platform",
  "description": "Build a complete e-commerce solution"
}
```
**Status**: 201 | **Resposta**: Project object

### Listar Projetos do Usuário
```http
GET /projects
Authorization: Bearer {token}
```
**Status**: 200 | **Resposta**: Array de projetos

### Obter Projeto por ID
```http
GET /projects/:id
Authorization: Bearer {token}
```
**Status**: 200 | **Resposta**: Project object
**Status**: 403 | **Erro**: Usuário não é membro do projeto

### Atualizar Projeto
```http
PATCH /projects/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```
**Status**: 200 | **Resposta**: Project atualizado

### Deletar Projeto
```http
DELETE /projects/:id
Authorization: Bearer {token}
```
**Status**: 204 | **Resposta**: Sem conteúdo

### Adicionar Usuário ao Projeto
```http
POST /projects/:projectId/users/:userId
Authorization: Bearer {token}
```
**Status**: 200 | **Resposta**: Project atualizado
**Status**: 400 | **Erro**: Usuário já é membro do projeto

### Remover Usuário do Projeto
```http
DELETE /projects/:projectId/users/:userId
Authorization: Bearer {token}
```
**Status**: 204 | **Resposta**: Sem conteúdo

---

## ✅ Tarefas

### Criar Tarefa
```http
POST /tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Design database schema",
  "description": "Create ERD and database structure",
  "projectId": "project-uuid",
  "assigneeId": "user-uuid"
}
```
**Status**: 201 | **Resposta**: Task object

### Listar Tarefas do Projeto
```http
GET /tasks?projectId=project-uuid
Authorization: Bearer {token}
```
**Status**: 200 | **Resposta**: Array de tarefas

### Listar Tarefas do Usuário
```http
GET /tasks
Authorization: Bearer {token}
```
**Status**: 200 | **Resposta**: Array de tarefas atribuídas

### Obter Tarefa por ID
```http
GET /tasks/:id
Authorization: Bearer {token}
```
**Status**: 200 | **Resposta**: Task object
**Status**: 403 | **Erro**: Usuário não tem acesso

### Atualizar Tarefa
```http
PATCH /tasks/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "status": "DOING",
  "assigneeId": "user-uuid"
}
```
**Status**: 200 | **Resposta**: Task atualizada

**Status válidos**: `TODO`, `DOING`, `DONE`

**Transições permitidas**:
- TODO → DOING, TODO
- DOING → DONE, DOING
- DONE → DONE

### Deletar Tarefa
```http
DELETE /tasks/:id
Authorization: Bearer {token}
```
**Status**: 204 | **Resposta**: Sem conteúdo

---

## 📊 Modelos de Dados

### User
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "createdAt": "date",
  "updatedAt": "date",
  "projects": "Project[]",
  "assignedTasks": "Task[]"
}
```

### Project
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "createdAt": "date",
  "updatedAt": "date",
  "users": "User[]",
  "tasks": "Task[]"
}
```

### Task
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "TODO | DOING | DONE",
  "projectId": "uuid",
  "assigneeId": "uuid (opcional)",
  "createdAt": "date",
  "updatedAt": "date",
  "project": "Project",
  "assignee": "User"
}
```

---

## ⚠️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| **400** | Requisição inválida |
| **401** | Token inválido ou expirado |
| **403** | Acesso negado (não é membro) |
| **404** | Recurso não encontrado |
| **500** | Erro interno do servidor |

