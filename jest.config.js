module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/tests/unit/**/*.test.js'],
  testEnvironment: 'node',
  transform: {},
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coveragePathIgnorePatterns: ['/node_modules/'],
};