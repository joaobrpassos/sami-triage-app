import { randomUUID } from "crypto";

export function logsMiddleware(req, res, next) {
  const requestId = randomUUID();        // Gera um ID único para a requisição
  const start = process.hrtime.bigint(); // Tempo inicial da requisição

  // Attach requestId to request for downstream usage
  req.requestId = requestId;

  // Quando a resposta for enviada
  res.on("finish", () => {
    const durationNs = process.hrtime.bigint() - start;
    const durationMs = Number(durationNs) / 1_000_000;

    const log = {
      timestamp: new Date().toISOString(),
      level: "info",
      requestId,
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      durationMs: durationMs.toFixed(2),
    };

    console.log(JSON.stringify(log));
  });

  next();
}

// Middleware para capturar erros
export function errorLoggingMiddleware(err, req, res, next) {
  const log = {
    timestamp: new Date().toISOString(),
    level: "error",
    requestId: req.requestId || null,
    method: req.method,
    route: req.originalUrl,
    message: err.message,
    stack: err.stack,
  };

  console.error(JSON.stringify(log));
  res.status(500).json({ error: "Internal Server Error" });
}
