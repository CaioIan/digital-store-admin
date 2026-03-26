# Category API Contract (Admin Front)

Este documento consolida o contrato de todas as rotas de categoria da API.

## Base URL
- http://localhost:3000

## Autenticacao e permissao
- A autenticacao e feita por cookie HTTP-only: access_token.
- O backend nao le Authorization Bearer para estas rotas; le cookie.
- Frontend deve enviar credenciais na requisicao:
  - Fetch: credentials: "include"
  - Axios: withCredentials: true

### Role por rota
- POST /v1/category: ADMIN
- PATCH /v1/category/:id: ADMIN
- DELETE /v1/category/:id: ADMIN
- GET /v1/category/:id: usuario autenticado (USER ou ADMIN)
- GET /v1/category/search: usuario autenticado (USER ou ADMIN)

---

## 1) Criar categoria

### Endpoint
- Metodo: POST
- Rota: /v1/category
- Role: ADMIN

### Body completo aceito
~~~json
{
  "name": "Games",
  "slug": "games",
  "use_in_menu": true
}
~~~

### Regras de validacao
- name: obrigatorio, string, min 1, max 50
- slug: obrigatorio, string, min 1, max 50
- use_in_menu: opcional, boolean
- schema strict: campos extras no body retornam 400

### Response de sucesso
- Status: 201
- Body (real): retorna o model criado
~~~json
{
  "id": "b42c4f5f-8f84-4a4d-bb9f-d3d74e95e0f4",
  "name": "Games",
  "slug": "games",
  "use_in_menu": true,
  "created_at": "2026-03-26T12:00:00.000Z",
  "updated_at": "2026-03-26T12:00:00.000Z"
}
~~~

### Responses de erro
- 400 (validacao)
~~~json
{
  "errors": [
    { "field": "name", "message": "Nome e obrigatorio" }
  ]
}
~~~
- 400 (duplicidade de name ou slug)
~~~json
{
  "status": "error",
  "message": "Categoria ja existe (nome ou slug duplicado)"
}
~~~
- 401
~~~json
{ "error": "Token nao fornecido" }
~~~
ou
~~~json
{ "error": "Token invalido ou expirado" }
~~~
- 403
~~~json
{ "error": "Acesso negado: permissao insuficiente" }
~~~

---

## 2) Editar categoria

### Endpoint
- Metodo: PATCH
- Rota: /v1/category/:id
- Role: ADMIN

### Params
- id: UUID obrigatorio

### Body completo aceito (todos obrigatorios)
~~~json
{
  "name": "Eletronicos",
  "slug": "eletronicos",
  "use_in_menu": false
}
~~~

### Regras de validacao
- name: obrigatorio, string, min 2, max 50
- slug: obrigatorio, string, min 2, max 50
- use_in_menu: obrigatorio, boolean
- schema strict: campos extras no body retornam 400

### Response de sucesso
- Status: 200
- Body
~~~json
{
  "id": "b42c4f5f-8f84-4a4d-bb9f-d3d74e95e0f4",
  "name": "Eletronicos",
  "slug": "eletronicos",
  "use_in_menu": false
}
~~~

### Responses de erro
- 400 (validacao body)
~~~json
{
  "errors": [
    { "field": "name", "message": "Nome e obrigatorio" },
    { "field": "slug", "message": "Slug e obrigatorio" },
    { "field": "use_in_menu", "message": "Uso no menu e obrigatorio" }
  ]
}
~~~
- 400 (id invalido)
~~~json
{
  "errors": [
    { "field": "id", "message": "ID deve ser um UUID valido" }
  ]
}
~~~
- 404 (categoria nao encontrada)
~~~json
{
  "status": "error",
  "message": "Recurso nao encontrado."
}
~~~
- 401
~~~json
{ "error": "Token nao fornecido" }
~~~
ou
~~~json
{ "error": "Token invalido ou expirado" }
~~~
- 403
~~~json
{ "error": "Acesso negado: permissao insuficiente" }
~~~

---

## 3) Deletar categoria (soft delete)

### Endpoint
- Metodo: DELETE
- Rota: /v1/category/:id
- Role: ADMIN

### Params
- id: UUID obrigatorio

### Body
- Nao ha body obrigatorio.
- Se enviar body, ele e ignorado.

### Response de sucesso
- Status: 200
- Body
~~~json
{
  "id": "b42c4f5f-8f84-4a4d-bb9f-d3d74e95e0f4",
  "name": "Games",
  "slug": "games",
  "use_in_menu": true
}
~~~

### Responses de erro
- 400 (id invalido)
~~~json
{
  "errors": [
    { "field": "id", "message": "ID deve ser um UUID valido" }
  ]
}
~~~
- 404 (categoria nao encontrada)
~~~json
{
  "status": "error",
  "message": "Recurso nao encontrado."
}
~~~
- 401
~~~json
{ "error": "Token nao fornecido" }
~~~
ou
~~~json
{ "error": "Token invalido ou expirado" }
~~~
- 403
~~~json
{ "error": "Acesso negado: permissao insuficiente" }
~~~

---

## 4) Buscar categoria por ID

### Endpoint
- Metodo: GET
- Rota: /v1/category/:id
- Role: autenticado (USER ou ADMIN)

### Params
- id: UUID obrigatorio

### Body
- Nao possui body.

### Response de sucesso
- Status: 200
- Body
~~~json
{
  "id": "b42c4f5f-8f84-4a4d-bb9f-d3d74e95e0f4",
  "name": "Eletronicos",
  "slug": "eletronicos",
  "use_in_menu": true
}
~~~

### Responses de erro
- 400 (id invalido)
~~~json
{
  "errors": [
    { "field": "id", "message": "ID deve ser um UUID valido" }
  ]
}
~~~
- 404
~~~json
{
  "status": "error",
  "message": "Recurso nao encontrado."
}
~~~
- 401
~~~json
{ "error": "Token nao fornecido" }
~~~
ou
~~~json
{ "error": "Token invalido ou expirado" }
~~~

---

## 5) Buscar categorias (paginado)

### Endpoint
- Metodo: GET
- Rota: /v1/category/search
- Role: autenticado (USER ou ADMIN)

### Query params (completos)
- limit: numero inteiro > 0, ou -1 para trazer tudo (default: 12)
- page: inteiro >= 1 (default: 1)
- fields: string CSV com campos (ex: name,slug,use_in_menu)
- use_in_menu: somente "true" (se informado, filtra categorias exibidas no menu)

### Body
- Nao possui body.

### Response de sucesso
- Status: 200
- Body
~~~json
{
  "data": [
    {
      "id": "b42c4f5f-8f84-4a4d-bb9f-d3d74e95e0f4",
      "name": "Games",
      "slug": "games",
      "use_in_menu": true
    }
  ],
  "total": 1,
  "limit": 12,
  "page": 1
}
~~~

Observacao sobre fields:
- Quando fields e enviado, a API pode retornar apenas os campos pedidos (o id e garantido pelo repository).

### Responses de erro
- 400 (query invalida)
~~~json
{
  "errors": [
    { "field": "limit", "message": "Limite deve ser positivo ou -1" }
  ]
}
~~~
- 401
~~~json
{ "error": "Token nao fornecido" }
~~~
ou
~~~json
{ "error": "Token invalido ou expirado" }
~~~

---

## Exemplo de integracao no Front Admin

### Axios
~~~javascript
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true
});
~~~

### Fetch
~~~javascript
await fetch("http://localhost:3000/v1/category", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Games",
    slug: "games",
    use_in_menu: true
  })
});
~~~
