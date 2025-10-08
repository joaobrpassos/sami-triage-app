import cors from "cors";

function parseOrigins(originsEnv) {
  if (!originsEnv) {
    return [];
  }

  return originsEnv
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export function buildCorsMiddleware() {
  const configuredOrigins = parseOrigins(process.env.CORS_ORIGINS);

  if (configuredOrigins.length === 0) {
    // No origins defined: allow all (useful during local development)
    return cors();
  }

  const corsOptions = {
    origin(origin, callback) {
      if (!origin || configuredOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  };

  return cors(corsOptions);
}
