
let triageCount = 0;
let totalDurationMs = 0;

export function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    // Considera apenas requisições POST para /triage
    if (req.method === "POST" && req.originalUrl.startsWith("/triage")) {
      const durationNs = process.hrtime.bigint() - start;
      const durationMs = Number(durationNs) / 1_000_000;

      triageCount += 1;
      totalDurationMs += durationMs;
    }
  });

  next();
}

// Função para expor métricas
export function getMetrics() {
  return {
    triageCount,
    averageDurationMs: triageCount > 0 ? (totalDurationMs / triageCount).toFixed(2) : 0,
  };
}

export function resetMetricsForTests() {
  if (process.env.NODE_ENV !== "test") {
    return;
  }

  triageCount = 0;
  totalDurationMs = 0;
}
