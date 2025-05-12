# Testing Structure

This document explains the testing structure used in this repository, covering both Jest testing configurations and GitHub Actions workflows.

## Test File Structure

```
/tests
├── unit/            # Unit tests
├── integration/     # Integration tests with LocalStack
│   ├── aws-integration.test.js
│   └── test-helpers.js
└── workflows/       # Local testing workflows
    └── test-action.yml
```

## Jest Configuration

The repository uses Jest for both unit and integration tests with different configurations:

### 1. Base Configuration (`jest.base.config.js`)

- Common Jest settings shared across all test types
- Defines environment, module file extensions, coverage settings, etc.

### 2. Unit Tests (`jest.config.js`)

- Extends the base configuration
- Targets `/tests/unit/**/*.test.js` files
- Collects coverage information
- Run with `npm test` or `npm run test:unit`

### 3. Integration Tests (`jest.integration.config.js`)

- Extends the base configuration
- Targets `/tests/integration/**/*.test.js` files
- Uses longer timeouts for external service calls
- Includes environment flags for Docker and AWS tests
- Run with `npm run test:integration`

## GitHub Actions Workflow Structure

The testing infrastructure consists of several workflows:

### 1. Main CI/CD Pipeline (`.github/workflows/test.yml`)

- Runs on all pushes to the main branch, pull requests, and manual triggers
- Validates the action.yml format
- Runs linters on the codebase
- Runs unit tests
- Runs integration tests with LocalStack
- Tests the GitHub Action with various configurations
- Provides comprehensive testing for all code changes

### 2. Example Workflow (`.github/workflows/use-chamber-fetch-ssm-secrets.yml`)

- Example workflow for users to understand how to use the action
- Only runs on manual workflow dispatch
- Demonstrates:
  - How to configure AWS credentials
  - How to fetch SSM parameters with different options
  - How to use the parameters in subsequent steps

### 3. Local Testing Workflow (`tests/workflows/test-action.yml`)

- Designed to be run locally with the `act` tool
- Tests the action in a local environment
- Primarily used for development and testing without GitHub

### 4. Reusable Workflows

- **`setup-localstack.yml`**: Sets up LocalStack and test parameters
- **`test-action-configs.yml`**: Tests the action with different configuration options
  - Namespaced parameters
  - Non-namespaced parameters
  - Custom parameter mappings

## Docker Environment

The Docker Compose configuration provides services needed for testing:

1. **LocalStack**: Simulates AWS services for local testing
2. **Test Runner**: Node.js environment for running tests against LocalStack

## Available npm Scripts

- `npm test` or `npm run test:unit`: Run unit tests only
- `npm run test:integration`: Run integration tests only
- `npm run test:all`: Run both unit and integration tests
- `npm run test:coverage`: Generate test coverage report
- `npm run test:watch`: Run tests in watch mode
- `npm run lint`: Run ESLint checks
- `npm run lint:fix`: Run ESLint and fix issues
- `npm run validate`: Validate action.yml format
- `npm run docker:test`: Run all tests in the Docker environment

## Testing Locally

### With Docker

```bash
# Start the Docker environment
make docker-dev-env

# Run tests in Docker
npm run docker:test

# Run specific test types in Docker
docker compose exec test-runner npm run test:unit
docker compose exec test-runner npm run test:integration
```

### With act

To test the GitHub Action locally with act:

1. Install [nektos/act](https://github.com/nektos/act)
2. Run the local testing workflow:
   ```bash
   act -j test-action -W tests/workflows/test-action.yml
   ```

## Integration Testing Notes

- Integration tests that require LocalStack automatically skip when not in Docker
- Test helpers in `tests/integration/test-helpers.js` provide common utilities
- Running integration tests requires:
  - LocalStack container running
  - AWS credentials set (automatically done in Docker)
  - Test parameters created in SSM Parameter Store

## Best Practices

1. **Unit Test First**: Cover core functionality with unit tests
2. **Mock External Services**: Use mocks for AWS services in unit tests
3. **Integration Test for Verification**: Use integration tests to verify real service behavior
4. **Consistent Configuration**: Use base configuration to ensure testing consistency
5. **Environment Awareness**: Use environment flags to skip tests when resources are unavailable