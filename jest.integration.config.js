module.exports = {
  clearMocks: false,
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/tests/integration/**/*.test.js'],
  testEnvironment: 'node',
  transform: {},
  verbose: true,
  testTimeout: 30000, // Integration tests may take longer
};