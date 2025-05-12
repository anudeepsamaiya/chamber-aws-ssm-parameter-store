# Tests for Chamber AWS SSM Parameter Store Action

This directory contains tests for the GitHub Action that sets up Chamber and fetches SSM parameters.

## Test Structure

The tests are organized as follows:

- `unit/`: Unit tests for parameter mapping functionality
- `integration/`: Integration tests with AWS SSM Parameter Store
- `fixtures/`: Test data and mock definitions
- `mocks/`: Mock implementations for AWS services
- `workflows/`: Example GitHub workflow for local testing

## Running Tests

### Unit Tests

Unit tests verify the parameter name mapping logic:

```sh
npm test
```

### Integration Tests

Integration tests validate actual interaction with AWS SSM Parameter Store:

```sh
# Run with mocked AWS responses
SKIP_AWS_TESTS=true npm run test:integration

# Run with real AWS (requires AWS credentials)
npm run test:integration
```

### GitHub Action Tests

You can test the GitHub Action locally using [act](https://github.com/nektos/act):

```sh
# Install act first: https://github.com/nektos/act
act -j test-action -W tests/workflows/test-action.yml
```

## Test Dependencies

- Jest: JavaScript testing framework
- aws-sdk-mock: For mocking AWS service responses
- sinon: JavaScript test spies, stubs, and mocks
- LocalStack: For local AWS service emulation in GitHub Actions

## Writing New Tests

When adding new tests:

1. For unit tests, add them to the `unit/` directory
2. For integration tests, add them to the `integration/` directory
3. Update any fixtures in the `fixtures/` directory as needed
4. For testing environment variable mapping, add new test cases to `parameter-mapping.test.js`

## Mocking AWS

The tests use two approaches for mocking AWS:

1. `aws-sdk-mock` for unit and integration tests in JavaScript
2. LocalStack for end-to-end testing in GitHub Actions workflows