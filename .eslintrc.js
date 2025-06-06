module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:node/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    'jest',
    'node',
  ],
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/tests/**/*.js'],
      rules: {
        'node/no-unpublished-require': 'off',
        'jest/no-disabled-tests': 'warn',
        'jest/expect-expect': 'off',
      },
      env: {
        jest: true,
      },
    },
    {
      files: ['**/*.yml', '**/*.yaml'],
      rules: {
        'node/no-unsupported-features/es-syntax': 'off',
      },
    },
  ],
};