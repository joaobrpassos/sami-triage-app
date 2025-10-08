# Sami Triage App

Aplicação full‑stack que simula o apoio a um enfermeiro na triagem inicial de pacientes, utilizando IA generativa para organizar as informações clínicas e sugerir próximos passos. O projeto foi desenvolvido para o desafio técnico da Sami Saúde, contemplando backend em Node.js/Express, frontend em React (Vite) e um provedor de IA pluggable com fallback para provider mock.

## Sumário

- [Visão Geral](#visão-geral)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Arquitetura e Pastas](#arquitetura-e-pastas)
- [Requisitos](#requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Execução](#execução)
- [Testes](#testes)
- [Observabilidade](#observabilidade)
- [Deploy](#deploy)
- [Licença](#licença)

## Visão Geral

O fluxo se inicia com o paciente preenchendo um formulário de triagem (`symptoms`, `severity`, `duration`, `age`, `gender`, `medicalHistory`, `currentMedications`). O backend valida e normaliza os dados, delega a geração do resumo para o provedor de IA configurado e retorna um sumário estruturado (mapeado em SOAP simplificado) e recomendações de próximo passo. Após a triagem, o paciente pode interagir com o chat para elaborar dúvidas adicionais.

## Principais Funcionalidades

- **Coleta estruturada de dados** via formulário responsivo no frontend.
- **Resumo SOAP** gerado pela IA com fallback automático para provider mock.
- **Chat médico** com manutenção de sessão e atualização do resumo.
- **Providers pluggables**: `mock` (default) e `flask` (integra com Flask + Gemini).
- **Observabilidade**: logs JSON, métricas de triagens e latência via `/metrics`.
- **Segurança básica**: CORS whitelist por `.env` e rate limiting por IP.

## Arquitetura e Pastas

```
app/
  backend/
    src/
      api/             # controllers HTTP (triage, chat)
      services/        # regras de negócio e validações
      providers/       # providers de IA (mock, flask)
      middleware/      # logs, métricas, CORS, rate limit
    tests/             # unit e integration (Jest + Supertest)
  frontend/            # SPA React (Vite)
  flask-ai/            # serviço de IA Python/Flask (Gemini)
docs/                  # diagramas e documentação adicional
README.md
SYSTEM_DESIGN.md
SELF_REVIEW.md
```

Mais detalhes estão em [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md).

## Requisitos

- Node.js **>= 18**
- npm **>= 9**
- Python 3.10+ (apenas se for rodar o provider Flask localmente)
- Docker Compose (opcional, para subir os serviços juntos)

## Configuração do Ambiente

1. Copie `.env.example` para `.env` na raiz do projeto e ajuste as variáveis conforme necessário.
   ```bash
   cp .env.example .env
   ```
2. Variáveis principais:
   - `AI_PROVIDER`: `mock` (default) ou `flask`.
   - `FLASK_AI_URL`: URL do serviço Flask (ex.: `http://localhost:5000`).
   - `GEMINI_API_KEY`, `GEMINI_MODEL`: obrigatórios somente para o provider Flask.
   - `CORS_ORIGINS`, `RATE_LIMIT_*`: ajuste as políticas de segurança conforme o ambiente.

### Dependências

Instale as dependências do backend e frontend:

```bash
# Backend
cd app/backend
npm install

# Frontend
cd ../frontend
npm install
```

Se for utilizar o provider Flask:

```bash
cd ../../flask-ai
pip install -r requirements.txt
```

## Execução

### Via npm (modo desenvolvimento)

```bash
# Backend (porta 3000)
cd app/backend
npm run dev

# Frontend (porta 5173)
cd ../frontend
npm run dev

# Provider Flask opcional (porta 5000)
cd ../flask-ai
python app.py
```

O backend serve o build do frontend quando o diretório `app/frontend/dist` existe. Em desenvolvimento, acesse o frontend em `http://localhost:5173`.

### Via Docker Compose

```bash
cd /path/do/projeto
docker-compose up --build
```

Isso sobe o backend em `http://localhost:3000` e o serviço Flask em `http://localhost:5000`.

## Testes

```bash
cd app/backend
npm test
```

Cobertura mínima:

- Unitários: `validateInitialInput`, `runTriage`, `mock.provider`.
- Integração: rota `POST /triage` com provider mock.

## Observabilidade

- **Logs estruturados**: middleware de logs (`middleware.logs.js`) registra JSON com `timestamp`, `requestId`, `route`, `durationMs`.
- **Métricas**: `GET /metrics` retorna número total de triagens e duração média em ms.

## Deploy

- Produção recomendada em plataforma PaaS (Railway, Render, Cloud Run). Ajuste variáveis `.env` e configure o provider real.
- Frontend: build com `npm run build` dentro de `app/frontend`; os artefatos ficam em `dist/`.
- Backend: `npm run start` em `app/backend`.
- Provider Flask: publicar a imagem ou serviço Python com as chaves do Gemini configuradas.

## Licença

Projeto desenvolvido exclusivamente para o desafio técnico da Sami Saúde.
