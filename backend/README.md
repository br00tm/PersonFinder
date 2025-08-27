# PersonFinder - Backend

API REST para busca de informações pessoais por empresa ou email, seguindo **Clean Architecture**, princípios **SOLID** e **Domain-Driven Design (DDD)**.

## 🏗️ Arquitetura

O projeto segue Clean Architecture com as seguintes camadas:

```
src/
├── domain/           # Camada de Domínio (regras de negócio)
│   ├── entities/     # Entidades (Person, Company)
│   ├── repositories/ # Interfaces de repositórios
│   └── services/     # Serviços de domínio
├── application/      # Camada de Aplicação (casos de uso)
│   └── usecases/     # Casos de uso específicos
├── infrastructure/   # Camada de Infraestrutura (implementações)
│   ├── providers/    # Provedores externos (Clearbit, Hunter, Mock)
│   └── repositories/ # Implementações de repositórios
├── presentation/     # Camada de Apresentação (controllers)
│   └── controllers/  # Controllers HTTP
└── shared/           # Utilitários compartilhados
    ├── container.ts  # Dependency Injection
    └── logger.ts     # Observabilidade e logs
```

## 🚀 Como Executar

### 1. Instalação
```bash
npm install
```

### 2. Configuração (Opcional)
Copie o arquivo de exemplo e configure as chaves de API:
```bash
# No Windows
copy config.example.env .env

# No Linux/Mac
cp config.example.env .env
```

**Nota**: Se não configurar as chaves de API, o sistema usará dados mock para demonstração.

### 3. Desenvolvimento
```bash
npm run dev
```

### 4. Produção
```bash
npm run build
npm start
```

### 5. Testes
```bash
# Execute o backend em um terminal
npm run dev

# Em outro terminal, execute os testes
npm test
```

## 📡 Endpoints

### Health Check
```
GET /health
```
Retorna status da aplicação e métricas básicas.

### Informações da API
```
GET /api/info
```
Retorna informações sobre a API e endpoints disponíveis.

### Busca de Pessoas
```
POST /api/search
Content-Type: application/json

{
  "query": "email@empresa.com" ou "NomeDaEmpresa",
  "type": "email" ou "company"
}
```

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": {
    "id": "person_123456",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "company": "Empresa LTDA",
    "instagram": "joao_silva",
    "whatsapp": "+5511999999999",
    "linkedIn": "https://linkedin.com/in/joao-silva",
    "hasContactInfo": true,
    "hasSocialMedia": true
  },
  "cached": false
}
```

### Métricas (Prometheus)
```
GET /metrics
```
Retorna métricas no formato Prometheus para monitoramento.

## 🔧 Funcionalidades

### Resiliência e Alta Disponibilidade
- **Circuit Breaker**: Protege contra falhas em APIs externas
- **Retry Logic**: Retry automático com backoff exponencial
- **Rate Limiting**: Limite de 100 requisições por minuto por IP
- **Graceful Shutdown**: Encerramento seguro do servidor
- **Error Handling**: Tratamento global de erros

### Observabilidade e Monitoramento
- **Logs Estruturados**: Winston com formato JSON
- **Métricas**: Contadores e gauges para monitoramento
- **Health Check**: Endpoint para verificação de saúde
- **Performance Tracking**: Logs de performance por operação

### Escalabilidade e Performance
- **Cache em Memória**: Cache de resultados por 30 minutos
- **Múltiplos Provedores**: Busca paralela em várias APIs
- **Async/Await**: Operações assíncronas não-bloqueantes
- **TypeScript**: Tipagem estática para maior confiabilidade

## 🔌 Provedores de Dados

### Mock Provider (Padrão)
Retorna dados fictícios para demonstração. Ativo por padrão.

### Clearbit Provider
Para usar, configure `CLEARBIT_API_KEY` no arquivo `.env`:
```env
CLEARBIT_API_KEY=sk_your_clearbit_key_here
```

### Hunter.io Provider
Para usar, configure `HUNTER_API_KEY` no arquivo `.env`:
```env
HUNTER_API_KEY=your_hunter_key_here
```

## 🎯 Princípios Aplicados

### SOLID
- **S** - Single Responsibility: Cada classe tem uma responsabilidade
- **O** - Open/Closed: Aberto para extensão, fechado para modificação
- **L** - Liskov Substitution: Subtipos substituem tipos base
- **I** - Interface Segregation: Interfaces específicas
- **D** - Dependency Inversion: Dependências por abstrações

### Domain-Driven Design (DDD)
- **Entities**: Person, Company com regras de negócio
- **Value Objects**: Email, Phone validation
- **Repositories**: Abstrações para persistência
- **Services**: Lógica de domínio complexa
- **Use Cases**: Orquestração de operações

### Clean Architecture
- **Independência de Frameworks**: Lógica não depende de Express
- **Testabilidade**: Fácil mock e teste de camadas
- **Independência de UI**: API pode servir web, mobile, etc.
- **Independência de Database**: Repositórios abstratos

## 📊 Monitoramento

### Logs
Os logs são salvos em:
- `logs/error.log` - Apenas erros
- `logs/combined.log` - Todos os logs
- Console - Para desenvolvimento

### Métricas Disponíveis
- `search_requests_total` - Total de requisições de busca
- `search_requests_successful` - Busca bem-sucedidas
- `search_requests_failed` - Busca falharam
- `search_cache_hits` - Hits do cache
- `search_cache_misses` - Misses do cache
- `rate_limit_exceeded` - Rate limit excedido
- `unhandled_errors_total` - Erros não tratados

## 🛠️ Desenvolvimento

### Estrutura de Pastas
- `domain/` - Regras de negócio puras
- `application/` - Casos de uso da aplicação
- `infrastructure/` - Implementações técnicas
- `presentation/` - Camada de entrada (HTTP)
- `shared/` - Código compartilhado

### Adicionando Novos Provedores
1. Implemente `ExternalPersonSearchProvider`
2. Adicione no `Container.createProviders()`
3. Configure variáveis de ambiente se necessário

### Executando em Docker
```bash
docker build -t personfinder-backend .
docker run -p 3000:3000 personfinder-backend
```

## 🔒 Segurança

- **Helmet**: Headers de segurança
- **CORS**: Configurado para frontend específico
- **Rate Limiting**: Proteção contra abuse
- **Input Validation**: Validação de entrada
- **Error Sanitization**: Não exposição de stack traces

## 📈 Performance

- **Cache**: Resultados em memória por 30 minutos
- **Parallel Processing**: Múltiplos provedores simultâneos
- **Connection Pooling**: Para futuras integrações com DB
- **Compression**: Headers otimizados

---

## 🚨 Próximos Passos

Para produção, considere:
- Banco de dados (PostgreSQL/MongoDB)
- Cache distribuído (Redis)
- Autenticação JWT
- Documentação OpenAPI/Swagger
- Testes automatizados (Jest)
- CI/CD pipeline
- Monitoramento com Prometheus + Grafana

