# Testes Postman - PersonFinder API

## 🚀 Configuração Base
- **URL Base**: `http://localhost:3000`
- **Content-Type**: `application/json`

---

## 1️⃣ Health Check
**Método**: `GET`  
**URL**: `http://localhost:3000/health`

**Resposta esperada**:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-27T22:08:26.397Z",
  "uptime": 62.5605421,
  "memory": {
    "rss": 72609792,
    "heapTotal": 18538496,
    "heapUsed": 15494952,
    "external": 4116099,
    "arrayBuffers": 103338
  },
  "version": "1.0.0"
}
```

---

## 2️⃣ Informações da API
**Método**: `GET`  
**URL**: `http://localhost:3000/api/info`

**Resposta esperada**:
```json
{
  "service": "PersonFinder API",
  "version": "1.0.0",
  "description": "API para busca de informações pessoais por empresa ou email",
  "endpoints": {
    "POST /api/search": "Buscar pessoa por email ou empresa",
    "GET /health": "Status da aplicação",
    "GET /metrics": "Métricas do sistema",
    "GET /api/info": "Informações da API"
  },
  "environment": "development"
}
```

---

## 3️⃣ Busca por Email
**Método**: `POST`  
**URL**: `http://localhost:3000/api/search`  
**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "query": "matheus.gomes@elroma.com.br",
  "type": "email"
}
```

**Resposta esperada (sem APIs configuradas)**:
```json
{
  "success": false,
  "error": "Nenhuma informação encontrada"
}
```

**Resposta esperada (com APIs configuradas)**:
```json
{
  "success": true,
  "data": {
    "id": "person_1234567890",
    "name": "Matheus Gomes",
    "email": "matheus.gomes@elroma.com.br",
    "company": "Elroma",
    "instagram": "matheus_gomes_dev",
    "whatsapp": "+5511999887766",
    "linkedIn": "https://linkedin.com/in/matheus-gomes-dev",
    "twitter": "https://twitter.com/matheus_dev",
    "phone": "+5511999887766",
    "hasContactInfo": true,
    "hasSocialMedia": true,
    "createdAt": "2025-08-27T22:10:00.000Z",
    "updatedAt": "2025-08-27T22:10:00.000Z"
  },
  "cached": false
}
```

---

## 4️⃣ Busca por Empresa
**Método**: `POST`  
**URL**: `http://localhost:3000/api/search`  
**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "query": "Elroma",
  "type": "company"
}
```

**Resposta esperada (sem APIs configuradas)**:
```json
{
  "success": true,
  "data": [],
  "cached": false
}
```

**Resposta esperada (com APIs configuradas)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "person_1234567891",
      "name": "João Silva",
      "email": "joao@elroma.com.br",
      "company": "Elroma",
      "instagram": "joao_silva",
      "whatsapp": "+5511888777666",
      "hasContactInfo": true,
      "hasSocialMedia": true
    },
    {
      "id": "person_1234567892",
      "name": "Maria Santos",
      "email": "maria@elroma.com.br",
      "company": "Elroma",
      "linkedIn": "https://linkedin.com/in/maria-santos",
      "hasContactInfo": true,
      "hasSocialMedia": true
    }
  ],
  "cached": false
}
```

---

## 5️⃣ Teste de Validação - Sem Query
**Método**: `POST`  
**URL**: `http://localhost:3000/api/search`  
**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "type": "email"
}
```

**Resposta esperada**:
```json
{
  "success": false,
  "error": "Query de busca é obrigatória"
}
```

---

## 6️⃣ Teste de Validação - Tipo Inválido
**Método**: `POST`  
**URL**: `http://localhost:3000/api/search`  
**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "query": "test@example.com",
  "type": "invalid"
}
```

**Resposta esperada**:
```json
{
  "success": false,
  "error": "Tipo de busca deve ser \"email\" ou \"company\""
}
```

---

## 7️⃣ Métricas (Prometheus)
**Método**: `GET`  
**URL**: `http://localhost:3000/metrics`

**Resposta esperada**:
```
# TYPE search_requests_total counter
search_requests_total 5
# TYPE search_requests_successful counter
search_requests_successful 2
# TYPE search_requests_failed counter
search_requests_failed 3
# TYPE search_cache_hits counter
search_cache_hits 0
# TYPE search_cache_misses counter
search_cache_misses 5
# TYPE http_requests_total counter
http_requests_total 15
# TYPE active_connections gauge
active_connections 1
```

---

## 8️⃣ Endpoint Inexistente (404)
**Método**: `GET`  
**URL**: `http://localhost:3000/inexistente`

**Resposta esperada**:
```json
{
  "success": false,
  "error": "Endpoint não encontrado",
  "availableEndpoints": [
    "POST /api/search",
    "GET /health",
    "GET /metrics",
    "GET /api/info"
  ]
}
```

---

## 🧪 **Sequência de Testes Recomendada**

1. **Health Check** - Verificar se servidor está rodando
2. **API Info** - Verificar informações básicas
3. **Busca por Email** - Testar funcionalidade principal
4. **Busca por Empresa** - Testar segundo tipo de busca
5. **Validações** - Testar tratamento de erros
6. **Métricas** - Verificar observabilidade
7. **404** - Testar endpoint inexistente

---

## 🔧 **Importar para Postman**

1. Abra o Postman
2. Clique em "Import"
3. Cole este JSON para criar uma collection:

```json
{
  "info": {
    "name": "PersonFinder API",
    "description": "Testes para API PersonFinder",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["health"]
        }
      }
    },
    {
      "name": "API Info",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/api/info",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "info"]
        }
      }
    },
    {
      "name": "Busca por Email",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"query\": \"matheus.gomes@elroma.com.br\",\n  \"type\": \"email\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/search",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "search"]
        }
      }
    },
    {
      "name": "Busca por Empresa",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"query\": \"Elroma\",\n  \"type\": \"company\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/search",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "search"]
        }
      }
    }
  ]
}
```

## ✅ **Status Esperado**
- **Sem APIs configuradas**: Retorna "Nenhuma informação encontrada"
- **Com APIs configuradas**: Retorna dados reais de pessoas/empresas
- **Todos os endpoints respondem** corretamente
- **Validação funciona** para entradas inválidas
