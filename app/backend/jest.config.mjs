export default {
  testEnvironment: "node",
  transform: {},
  roots: ["<rootDir>/tests"],
  moduleDirectories: ["node_modules", "<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>/tests/test.setup.js"],
};
