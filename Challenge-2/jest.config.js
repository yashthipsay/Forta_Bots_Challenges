module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageReporters: ["text", "cobertura"],
  testPathIgnorePatterns: ["dist"],
};
