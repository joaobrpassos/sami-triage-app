#!/usr/bin/env bash
set -euo pipefail

# Deploys the previously built image to Google Cloud Run.
# Usage:
#   PROJECT_ID="my-project" SERVICE_NAME="sami-triage" REGION="us-central1" ./scripts/deploy-cloud-run.sh
#   Additional env vars: MAX_INSTANCES, MIN_INSTANCES, AI_PROVIDER, CORS_ORIGINS, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX

PROJECT_ID=${PROJECT_ID:-}
SERVICE_NAME=${SERVICE_NAME:-sami-triage}
REGION=${REGION:-us-central1}
IMAGE=${IMAGE:-"gcr.io/${PROJECT_ID}/${SERVICE_NAME}"}
PORT=${PORT:-8080}
MAX_INSTANCES=${MAX_INSTANCES:-3}
MIN_INSTANCES=${MIN_INSTANCES:-0}
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

if [[ -z "$PROJECT_ID" ]]; then
  echo "PROJECT_ID must be set" >&2
  exit 1
fi

if [[ -z "$REGION" ]]; then
  echo "REGION must be set" >&2
  exit 1
fi

if [[ -z "$SERVICE_NAME" ]]; then
  echo "SERVICE_NAME must be set" >&2
  exit 1
fi

ENV_VARS=("PORT=${PORT}")

# Optional runtime env vars
[[ -n "${AI_PROVIDER:-}" ]] && ENV_VARS+=("AI_PROVIDER=${AI_PROVIDER}")
[[ -n "${CORS_ORIGINS:-}" ]] && ENV_VARS+=("CORS_ORIGINS=${CORS_ORIGINS}")
[[ -n "${RATE_LIMIT_WINDOW_MS:-}" ]] && ENV_VARS+=("RATE_LIMIT_WINDOW_MS=${RATE_LIMIT_WINDOW_MS}")
[[ -n "${RATE_LIMIT_MAX:-}" ]] && ENV_VARS+=("RATE_LIMIT_MAX=${RATE_LIMIT_MAX}")
[[ -n "${FLASK_AI_URL:-}" ]] && ENV_VARS+=("FLASK_AI_URL=${FLASK_AI_URL}")
[[ -n "${GEMINI_API_KEY:-}" ]] && ENV_VARS+=("GEMINI_API_KEY=${GEMINI_API_KEY}")
[[ -n "${GEMINI_MODEL:-}" ]] && ENV_VARS+=("GEMINI_MODEL=${GEMINI_MODEL}")

ENV_VARS_STRING=$(IFS=, ; echo "${ENV_VARS[*]}")

echo "Deploying ${IMAGE} to Cloud Run service ${SERVICE_NAME} in ${REGION}" \
  "with env vars: ${ENV_VARS_STRING}"

gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --max-instances "${MAX_INSTANCES}" \
  --min-instances "${MIN_INSTANCES}" \
  --set-env-vars "${ENV_VARS_STRING}"

echo "Deployment complete."
