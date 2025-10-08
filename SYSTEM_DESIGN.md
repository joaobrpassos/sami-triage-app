# System Design – Sami Triage App

## 1. Objetivo & Escopo
O sistema oferece suporte à triagem inicial de pacientes, coletando dados clínicos básicos, organizando-os em um resumo estruturado (modelo SOAP simplificado) e sugerindo próximos passos. Inclui uma interface para o paciente responder perguntas e um chat com IA para tirar dúvidas adicionais. O foco é demonstrar fundamentos de engenharia de software (arquitetura em camadas, testes, observabilidade, segurança e integração com IA generativa) usando tecnologia full‑stack JavaScript/TypeScript.

## 2. Requisitos
### 2.1 Funcionais
- Coleta de dados clínicos (sintomas, severidade, duração, idade, gênero, histórico médico, medicações atuais).
- Geração de resumo estruturado da triagem usando IA generativa (SOAP simplificado).
- Recomendação de próximo passo (autoatendimento, teleconsulta, pronto atendimento).
- Chat interativo pós-triagem com apoio da IA.
- Alternância de provedor de IA via variável de ambiente (`AI_PROVIDER`), com fallback para provider mock.
- Endpoints REST: `GET /healthz`, `POST /triage`, `POST /chat`, `GET /metrics`.

### 2.2 Não Funcionais
- Node.js 18+, frontend React via Vite.
- Arquitetura em camadas (API, Services, Providers, Adapters, Middleware).
- Observabilidade: logs estruturados e métricas básicas.
- Segurança: CORS whitelist configurável, rate limiting, sanitização básica.
- Testes: mínimo 3 unitários + 1 integração.
- Deploy simples (Docker ou PaaS) sem expor segredos.

## 3. Arquitetura
### 3.1 Camadas
- **Frontend (`app/frontend/`)**: SPA React responsável por coletar dados, exibir o resumo e prover chat interativo.
- **Backend (`app/backend/`)**: API Express dividida em camadas:
  - `api/`: controllers HTTP (`triage.controller.js`, `chat.controller.js`).
  - `services/`: regras de negócio (`triage.service.js`, validação).
  - `providers/ai/`: integração com IA (mock, Flask/Gemini) com seletor e fallback automático.
  - `middleware/`: logs, métricas, CORS, rate limit.
- **Flask AI (`app/flask-ai/`)**: serviço Python opcional que encapsula chamadas ao Gemini.

### 3.2 Fluxo
1. Usuário preenche formulário na SPA e envia `POST /triage`.
2. Backend valida entrada (`ValidateInputTriage`), normaliza dados e constrói prompt.
3. `triage.service` chama `aiProvider.complete`. Se o provider real falhar, o fallback `mock` responde.
4. Resumo é retornado ao frontend, exibido na UI e armazenado para o chat.
5. Chat envia mensagens para `POST /chat`, que reutiliza a sessão de IA.
6. Métricas (`metricsMiddleware`) contabilizam duração e quantidade de triagens; logs estruturados (`logsMiddleware`) registram cada requisição.

### 3.3 Dependências Externas
- Gemini (via `app/flask-ai/agent.py`) — opcional; fallback mock garante funcionamento sem chave.
- Nenhum banco de dados persistente (requisito opcional não implementado).

## 4. Decisões de Design
- **Fallback automático**: Garante operação sem credenciais ou com indisponibilidade do serviço real.
- **Flask como adapter de IA**: Permite isolamento da lógica de prompt e ferramentas Python, facilitando troca por outro provedor.
- **Logs JSON + métricas em memória**: Atende requisito de observabilidade com baixo custo. Dados resetáveis em testes.
- **Sem persistência**: Optou-se por cumprir requisitos mínimos; uma camada de storage (SQLite/Prisma) pode ser adicionada depois.
- **React + Vite**: Escolha pela velocidade de desenvolvimento e integração simples com Node.
- **Jest (ESM)**: Configuração com `NODE_OPTIONS=--experimental-vm-modules` para suportar módulos ES em testes.

## 5. Deploy
- **Ambiente local**: `npm run dev` no backend e frontend; provider Flask opcional (`python app.py`).
- **Docker Compose**: `docker-compose.yml` sobe backend e Flask AI compartilhando `.env`.
- **Produção sugerida**: Deploy monolítico do backend (Render/Railway/Cloud Run) com build do frontend servido por Express. O serviço Flask pode ser containerizado separadamente ou substituído por provedores SaaS.
- **Configuração**: variáveis em `.env` (moldadas por `.env.example`) — garantir que segredos não sejam versionados.

## 6. Limitações & Próximos Passos
- Não há persistência de triagens (armazenamento opcional). Próximo passo: adicionar camada `storage/` com SQLite (Prisma) e endpoints para histórico/exportação.
- Chat não possui streaming ou estado compartilhado em banco — futuro incremento.
- Observabilidade limitada a métricas em memória; integrar com Prometheus/Grafana seria evolução natural.
- Deploy contínuo (CI/CD) e testes end-to-end ainda não implementados.
