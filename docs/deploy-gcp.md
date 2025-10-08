# Google Cloud Deployment – Sami Triage App

Este guia mostra como publicar a aplicação usando **Google Cloud Run**, que executa contêineres stateless e expõe uma URL HTTPS gerenciada. A abordagem empacota backend + frontend em um único container Node. O provider de IA default continuará sendo `mock`; ajuste as variáveis se quiser usar o Flask/Gemini.

## 1. Pré-requisitos
- Conta Google Cloud com faturamento habilitado (Cloud Run requer projeto faturável).
- `gcloud` CLI instalado e autenticado (`gcloud auth login`).
- Docker instalado localmente para build do container.
- Projeto Google Cloud configurado e selecionado:
  ```bash
  gcloud config set project <SEU_PROJETO>
  ```

## 2. Estrutura do Container
O container precisa:
1. Copiar `app/backend/` e `app/frontend/`.
2. Instalar dependências backend & frontend.
3. Gerar `app/frontend/dist`.
4. Expor o servidor Express (`npm run start`).

Um `Dockerfile` pronto já está disponível na raiz do projeto: `./Dockerfile`. Ele segue o modelo abaixo (Stage 1 para build do frontend e Stage 2 para runtime Node):

```dockerfile
# Stage 1 - Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copia apenas arquivos necessários
COPY app/backend/package*.json app/backend/
COPY app/frontend/package*.json app/frontend/

RUN npm install --prefix app/backend \
    && npm install --prefix app/frontend

COPY app/backend app/backend
COPY app/frontend app/frontend

RUN npm run build --prefix app/frontend

# Stage 2 - Runtime
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copia arquivos finais do builder
COPY --from=builder /app/app/backend /app/app/backend
COPY --from=builder /app/app/frontend/dist /app/app/frontend/dist
COPY package*.json ./

# Instala apenas dependências de produção do backend
RUN npm install --omit=dev --prefix app/backend

EXPOSE 8080

CMD ["npm", "run", "start", "--prefix", "app/backend"]
```

> O backend usa porta 3000 por padrão, mas o Cloud Run exige que a aplicação escute na porta definida pela variável `PORT`. Dentro de `app/backend/src/server.js` o valor padrão já é `process.env.PORT || 3000`, então nenhum ajuste adicional é necessário.

## 3. Variáveis de Ambiente
Crie um arquivo `.env.production` (não versionado) com os valores usados em produção. Por exemplo:

```
PORT=8080
AI_PROVIDER=mock
CORS_ORIGINS=https://<seu-domínio>.run.app
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
```

Se for integrar o Flask/Gemini, adicione `FLASK_AI_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`. Esses valores serão registrados no Cloud Run posteriormente.

## 4. Build e Deploy
Scripts auxiliares foram adicionados em `scripts/` para automatizar os comandos abaixo:

- `scripts/build-image.sh`: envia a imagem para o Container Registry.
- `scripts/deploy-cloud-run.sh`: realiza o deploy na Cloud Run com variáveis configuráveis.

### 4.1 Usando os scripts

```bash
# Build da imagem
PROJECT_ID=<seu-projeto> SERVICE_NAME=sami-triage ./scripts/build-image.sh

# Deploy na Cloud Run
PROJECT_ID=<seu-projeto> REGION=us-central1 SERVICE_NAME=sami-triage \
  AI_PROVIDER=mock CORS_ORIGINS=https://<sua-url>.run.app \
  ./scripts/deploy-cloud-run.sh
```

Você pode informar variáveis adicionais (ex.: `FLASK_AI_URL`, `GEMINI_API_KEY`) como parte do comando acima.

### 4.2 Comandos manuais (alternativa)
```bash
# Build da imagem (substitua <REGION> e <SERVICE-NAME>)
gcloud builds submit --tag gcr.io/<SEU_PROJETO>/<SERVICE-NAME>

# Deploy no Cloud Run
gcloud run deploy <SERVICE-NAME> \
  --image gcr.io/<SEU_PROJETO>/<SERVICE-NAME> \
  --platform managed \
  --region <REGION> \
  --allow-unauthenticated
```

Nas perguntas interativas, aceite a porta 8080. Ao final, a CLI exibirá a URL pública do serviço (`https://<SERVICE-NAME>-<hash>-<REGION>.run.app`).

## 5. Variáveis no Cloud Run
Após o deploy:
```bash
gcloud run services update <SERVICE-NAME> \
  --region <REGION> \
  --set-env-vars PORT=8080,AI_PROVIDER=mock,CORS_ORIGINS=https://<URL>,RATE_LIMIT_WINDOW_MS=60000,RATE_LIMIT_MAX=60
```

Adicione outras variáveis conforme necessidade (`FLASK_AI_URL`, `GEMINI_API_KEY`).

## 6. Provider Flask (opcional)
1. Construa e publique uma imagem separada para `app/flask-ai` (pode usar Cloud Run também).
2. Ajuste `FLASK_AI_URL` no serviço principal para a URL pública do Flask.
3. Garanta que `GEMINI_API_KEY` esteja configurada no serviço Flask.

## 7. Checklist Pós-deploy
- `curl https://<URL>/healthz` retorna `{ "status": "ok" }`.
- `POST /triage` responde corretamente quando `AI_PROVIDER=mock`.
- Métricas disponíveis em `GET /metrics`.
- Frontend estático acessível na raiz da URL.
- Rate limiting/CORS funcionam conforme configurado.

> Dica: se quiser usar domínio customizado, o Cloud Run oferece configuração de DNS e HTTPS gerenciado.

Com esses passos, você terá a aplicação publicada em Google Cloud usando Docker + Cloud Run. Ajuste a pipeline (Cloud Build/Cloud Deploy) para automatizar builds conforme necessidade.
