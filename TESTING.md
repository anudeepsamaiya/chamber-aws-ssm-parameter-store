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

### Reusable Workflow Components

The testing infrastructure consists of several reusable components:

1. **`setup-node-docker.yml`**
   - Sets up Node.js with caching
   - Configures Docker with buildx
   - Provides consistent environment for all jobs

2. **`setup-localstack.yml`**
   - Sets up LocalStack container
   - Configures AWS CLI for LocalStack
   - Sets up test parameters
   - Handles health checks and timeout
   - Provides status output for conditional job execution

3. **`test-action-configs.yml`**
   - Runs tests for different action configurations in parallel
   - Tests namespaced parameters
   - Tests non-namespaced parameters
   - Tests custom parameter mappings
   - Tests action standards compliance
   - Provides summary report

### Main Workflows

1. **Main CI/CD Pipeline (`.github/workflows/test.yml`)**
   - Runs on all pushes to main, pull requests, and manual triggers
   - Configurable Node.js version and AWS region
   - Sets up dependencies with caching
   - Validates the action.yml format
   - Runs linters on the codebase
   - Runs unit tests with coverage reporting
   - Runs integration tests with LocalStack
   - Tests the action with different configurations in parallel
   - Provides comprehensive test reports

2. **Example Workflow (`.github/workflows/use-chamber-fetch-ssm-secrets.yml`)**
   - Example workflow for users to understand how to use the action
   - Configurable parameters through workflow_dispatch inputs
   - Demonstrates multiple usage patterns
   - Shows both namespaced and non-namespaced examples

3. **Local Testing Workflow (`tests/workflows/test-action.yml`)**
   - Designed to be run locally with the `act` tool
   - Complete end-to-end testing of the action
   - Configurable timeouts and versions
   - Improved error handling and diagnostics

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
   act -j test-action-locally -W tests/workflows/test-action.yml
   ```

## Integration Testing Notes

- Integration tests that require LocalStack automatically skip when not in Docker
- Test helpers in `tests/integration/test-helpers.js` provide common utilities
- Running integration tests requires:
  - LocalStack container running
  - AWS credentials set (automatically done in Docker)
  - Test parameters created in SSM Parameter Store

## Workflow Improvements

Recent improvements to the workflow structure:

1. **Enhanced Caching Strategy**
   - Added Node.js module caching
   - Implemented Docker image caching
   - Using npm ci for more reliable installs

2. **Parallel Job Execution**
   - Split test-action-configs into parallel jobs
   - Configuration tests now run simultaneously
   - Faster feedback cycle for test failures

3. **Improved Error Handling**
   - Enhanced parameter validation
   - Added better error tracking and reporting
   - Improved cleanup with appropriate conditionals
   - Added timeout to prevent hanging on failed service startup

4. **Configurable Workflows**
   - Added workflow_dispatch inputs for custom configuration
   - Made Node.js version and wait times configurable
   - Parameterized common settings

5. **Better Documentation**
   - Workflow files include detailed comments
   - Improved step descriptions
   - Better job naming for clarity

## Best Practices

1. **Unit Test First**: Cover core functionality with unit tests
2. **Mock External Services**: Use mocks for AWS services in unit tests
3. **Integration Test for Verification**: Use integration tests to verify real service behavior
4. **Consistent Configuration**: Use base configuration to ensure testing consistency
5. **Environment Awareness**: Use environment flags to skip tests when resources are unavailable
6. **Parallel Testing**: Run tests in parallel when possible
7. **Proper Cleanup**: Ensure resources are cleaned up even when tests fail
8. **Comprehensive Reporting**: Generate detailed test reports for analysis