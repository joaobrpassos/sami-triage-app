# Public Deployment Guide

Este guia descreve como publicar a aplicação em produção usando serviços PaaS gratuitos ou de baixo custo. O objetivo é disponibilizar o backend Express (que também serve o build do frontend) em um único host. O provider de IA padrão será o `mock`, garantindo funcionamento sem chaves. Opcionalmente, é possível subir o serviço Flask + Gemini separadamente.

## 1. Pré-requisitos
- Repositório público no GitHub ou GitLab.
- Conta em um provedor PaaS (Render ou Railway, por exemplo).
- Node.js 18+ instalado localmente para build/testes antes do deploy.

## 2. Estrutura de Build
O backend (`app/backend/src/server.js`) serve o conteúdo estático de `app/frontend/dist`. Portanto, o pipeline de deploy precisa:

1. Instalar dependências do backend (`app/backend`).
2. Instalar dependências do frontend (`app/frontend`).
3. Rodar `npm run build` no frontend para gerar `app/frontend/dist`.
4. Inicializar o backend com `npm run start` (que executa `node src/server.js`).

## 3. Render (Web Service)
1. Acesse [Render.com](https://render.com) e clique em **New > Web Service**.
2. Conecte sua conta GitHub/GitLab e selecione o repositório.
3. Configure o serviço com os seguintes valores:
   - **Name**: `sami-triage-backend` (ou outro de sua escolha).
   - **Region**: selecione a mais próxima.
   - **Branch**: `main` (ou branch desejada).
   - **Runtime**: Node
   - **Build Command**:
     ```bash
     npm install --prefix app/backend \
       && npm install --prefix app/frontend \
       && npm run build --prefix app/frontend
     ```
   - **Start Command**:
     ```bash
     cd app/backend && npm run start
     ```
4. Em **Environment Variables**, adicione:
   - `AI_PROVIDER=mock`
   - `CORS_ORIGINS=https://<seu-dominio-render>.onrender.com`
   - Opcional: `RATE_LIMIT_WINDOW_MS=60000`, `RATE_LIMIT_MAX=60`
   - Para usar o provider Flask/Gemini, informe também `FLASK_AI_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL` e libere o acesso à URL correspondente.
5. Clique em **Create Web Service**. Render executará o build e iniciará o servidor. A URL pública será algo como `https://sami-triage-backend.onrender.com`.
6. Após o primeiro deploy, acesse `https://<render-url>/healthz` para validar a saúde do serviço.

## 4. Railway (alternativa)
1. Crie um projeto em [Railway.app](https://railway.app) e importe o repositório.
2. Em **Deploys > New Service > GitHub Repo**, selecione este projeto.
3. Nas configurações do serviço, defina:
   - **Build Command**:
     ```bash
     npm install --prefix app/backend \
       && npm install --prefix app/frontend \
       && npm run build --prefix app/frontend
     ```
   - **Start Command**: `cd app/backend && npm run start`
   - **Root Directory**: `/` (padrão)
4. Configure as variáveis de ambiente conforme descrição de Render.
5. Ao finalizar o deploy, Railway fornecerá uma URL pública (ex.: `https://sami-triage.up.railway.app`).

## 5. Provider Flask (opcional)
Caso queira usar o resumo fornecido via Gemini:
1. Publique `app/flask-ai` como um serviço separado (ex.: Render ou Railway).
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
2. Defina as variáveis de ambiente:
   - `GEMINI_API_KEY=<sua-chave>`
   - `GEMINI_MODEL=gemini-2.5-flash` (ou outro disponível)
3. Copie a URL pública desse serviço e configure `FLASK_AI_URL` no backend (ex.: `https://sami-flask.onrender.com`).
4. Ajuste a lista de CORS (`CORS_ORIGINS`) para permitir chamadas cruzadas se o frontend estiver hospedado em outro domínio.

## 6. Checklist Pós-deploy
- [ ] `GET /healthz` retorna `{ "status": "ok" }`.
- [ ] `POST /triage` funciona com o provider `mock`.
- [ ] Métricas em `GET /metrics` respondem com JSON (`{ triageCount, averageDurationMs }`).
- [ ] Frontend build está acessível (se servir pelo backend).
- [ ] Variáveis sensíveis (GEMINI_API_KEY) configuradas apenas no ambiente de produção.
- [ ] Opcional: configurar HTTPS personalizado e monitoramento (Render oferece alertas básicos com logs em tempo real).

Com esse setup, o backend servirá o frontend estaticamente. Não é necessário um deploy separado do frontend, a menos que prefira utilizar um CDN (Netlify/Vercel). Nesse caso, configure `vite build` no serviço estático e aponte o backend (`/triage`, `/chat`) para a URL pública Render/Railway.
