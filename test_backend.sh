#!/bin/bash
set -e

BASE_URL="http://localhost:3000"

# Função para checar e validar resposta
check_response() {
  local resp="$1"
  local expected="$2"

  if [[ "$resp" == *"$expected"* ]]; then
    echo "✅ VÁLIDO"
  else
    echo "❌ ERRO"
    echo "$resp"
  fi
}

echo "🔹 1) Healthcheck"
resp=$(curl -s $BASE_URL/healthz)
check_response "$resp" "ok"
echo "----------------------------------"

echo "🔹 2) Fluxo Normal (Sintomas Comuns)"
resp=$(curl -s -X POST $BASE_URL/triage \
  -H "Content-Type: application/json" \
  -d '{"age":30,"symptoms":"headache, fever","history":"none"}')
check_response "$resp" "Teleconsultation recommended"
echo "----------------------------------"

echo "🔹 3) Fluxo Crítico (Chest Pain)"
resp=$(curl -s -X POST $BASE_URL/triage \
  -H "Content-Type: application/json" \
  -d '{"age":55,"symptoms":"chest pain, cough","history":"none"}')
check_response "$resp" "Seek emergency care"
echo "----------------------------------"

echo "🔹 4) Início de Chat (start_chat = true - se implementado)"
resp=$(curl -s -X POST $BASE_URL/triage \
  -H "Content-Type: application/json" \
  -d '{"age":40,"symptoms":"headache","history":"none"}')
check_response "$resp" "partial_summary"
echo "----------------------------------"

echo "🔹 5) Input Inválido - Idade fora do range"
resp=$(curl -s -X POST $BASE_URL/triage \
  -H "Content-Type: application/json" \
  -d '{"age":-5,"symptoms":"headache","history":"none"}')
check_response "$resp" "error"
echo "----------------------------------"

echo "🔹 6) Input Inválido - Sem sintomas"
resp=$(curl -s -X POST $BASE_URL/triage \
  -H "Content-Type: application/json" \
  -d '{"age":25,"symptoms":"","history":"none"}')
check_response "$resp" "error"
echo "----------------------------------"

echo "🔹 7) Histórico longo (testar sanitização)"
resp=$(curl -s -X POST $BASE_URL/triage \
  -H "Content-Type: application/json" \
  -d '{"age":35,"symptoms":"fatigue, anxiety","history":"chain-smoker; alcoholic; gambling addict; meth user"}')
check_response "$resp" "Teleconsultation recommended"
echo "----------------------------------"

echo "🔹 8) (Opcional) Métricas - se implementado"
resp=$(curl -s $BASE_URL/metrics)
if [[ -n "$resp" ]]; then
  echo "Resposta /metrics:"
  echo "$resp"
else
  echo "⚠ /metrics não implementado"
fi
echo "----------------------------------"
check_response "$resp" "triagens"
