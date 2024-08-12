module.exports = {
    preset: "ts-jest",
    collectCoverage: true,
    coverageReporters: ["text", "cobertura"],
    testEnvironment: "node",
    testPathIgnorePatterns: ["dist"],
  };
  
  // "jest": {
  //   "collectCoverage": true,
  //   "coverageReporters": [
  //     "text",
  //     "cobertura"
  //   ]
  // },