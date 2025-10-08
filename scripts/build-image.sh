#!/usr/bin/env bash
set -euo pipefail

# Builds and submits the container image to Google Container Registry (GCR).
# Usage:
#   PROJECT_ID="my-project" SERVICE_NAME="sami-triage" ./scripts/build-image.sh

PROJECT_ID=${PROJECT_ID:-}
SERVICE_NAME=${SERVICE_NAME:-sami-triage}
REGION=${REGION:-us-central1}
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

if [[ -z "$PROJECT_ID" ]]; then
  echo "PROJECT_ID must be set" >&2
  exit 1
fi

IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Building and submitting image: ${IMAGE}"

gcloud builds submit --tag "${IMAGE}" --region "${REGION}" "${ROOT_DIR}"

echo "Image available at ${IMAGE}"
