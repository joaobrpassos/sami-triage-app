import mock from "./mock.provider.js";
import flask from "./flask.provider.js";

const providers = { mock, flask };
const providerName = process.env.AI_PROVIDER || "mock";

const aiProvider = providers[providerName];
if (!aiProvider) throw new Error(`AI provider ${providerName} not found`);

export default aiProvider;
