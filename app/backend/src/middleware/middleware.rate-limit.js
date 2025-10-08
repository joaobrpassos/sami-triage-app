import rateLimit from "express-rate-limit";

function toPositiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number) || number <= 0) {
    return fallback;
  }
  return number;
}

export function buildRateLimitMiddleware() {
  const windowMs = toPositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 60_000);
  const maxRequests = toPositiveInteger(process.env.RATE_LIMIT_MAX, 60);

  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests. Please try again later.",
    },
  });
}
