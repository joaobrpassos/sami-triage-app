import mock from "./mock.provider.js";
import flask from "./flask.provider.js";

const providers = { mock, flask };
const FALLBACK_PROVIDER_NAME = "mock";
const providerName = process.env.AI_PROVIDER || FALLBACK_PROVIDER_NAME;

const primaryProvider = providers[providerName];
if (!primaryProvider) throw new Error(`AI provider ${providerName} not found`);

const fallbackProvider = providers[FALLBACK_PROVIDER_NAME];
if (!fallbackProvider) throw new Error(`Fallback AI provider ${FALLBACK_PROVIDER_NAME} not found`);

function shouldFallback(error) {
  if (!error) return false;
  const fallbackErrorCodes = new Set([
    "AI_PROVIDER_CONFIG_ERROR",
    "AI_PROVIDER_NETWORK_ERROR",
    "AI_PROVIDER_HTTP_ERROR",
  ]);
  return typeof error.code === "string" && fallbackErrorCodes.has(error.code);
}

async function callWithFallback(methodName, ...args) {
  const provider = primaryProvider[methodName];
  const fallbackMethod = fallbackProvider[methodName];

  if (typeof provider !== "function") {
    if (primaryProvider === fallbackProvider) {
      throw new Error(`Fallback provider missing method ${methodName}`);
    }
    return fallbackMethod(...args);
  }

  try {
    return await provider.apply(primaryProvider, args);
  } catch (error) {
    if (primaryProvider !== fallbackProvider && shouldFallback(error)) {
      console.warn(
        `Primary AI provider '${primaryProvider.name}' failed (${error.code}). Falling back to '${fallbackProvider.name}'.`
      );
      if (typeof fallbackMethod === "function") {
        return fallbackMethod.apply(fallbackProvider, args);
      }
    }
    throw error;
  }
}

export default {
  ...primaryProvider,
  async complete(...args) {
    return callWithFallback("complete", ...args);
  },
  async chat(message, options) {
    return callWithFallback("chat", message, options);
  },
};
