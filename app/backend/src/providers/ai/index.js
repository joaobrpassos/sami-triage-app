import mock from "./mock.provider.js";
import flask from "./flask.provider.js";

const providers = { mock, flask };
const providerName = process.env.AI_PROVIDER || "flask";

const aiProvider = providers[providerName];
if (!aiProvider) throw new Error(`AI provider ${providerName} not found`);

export default {
  ...aiProvider,
  async chat(message, options) {
    if (typeof aiProvider.chat !== "function") {
      throw new Error(`AI provider ${providerName} does not support chat()`);
    }
    return aiProvider.chat(message, options);
  },
};
