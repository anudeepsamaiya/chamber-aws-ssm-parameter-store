# GitHub Action Workflows

This directory contains GitHub Actions workflows for testing and demonstrating the Chamber AWS SSM Parameter Store action.

## Parallel Testing Architecture

We use multiple independent workflows that run in parallel to optimize testing speed:

### Test Workflows

1. **Validate** (`validate.yml`)
   - Validates the action.yml structure and configuration
   - Ensures all required fields are present and properly formatted

2. **Lint** (`lint.yml`)
   - Runs ESLint to ensure code quality
   - Enforces code style standards

3. **Unit Tests** (`unit-tests.yml`)
   - Executes unit tests using Jest
   - Uploads test coverage reports as artifacts

4. **Integration Tests** (`integration-tests.yml`)
   - Sets up LocalStack for AWS SSM Parameter Store simulation
   - Runs integration tests against the LocalStack instance

5. **Test Parameter Configurations** (`test-parameter-configurations.yml`)
   - Tests all parameter configurations:
     - Namespaced parameters (default)
     - Non-namespaced parameters
     - Custom parameter mappings

6. **Test Summary** (`test.yml`)
   - Aggregates results from all other workflows
   - Generates a comprehensive test report

### Example Workflow

- **Usage Example** (`use-chamber-fetch-ssm-secrets.yml`)
  - Demonstrates how to use the action in real-world workflows
  - Shows how to access and use parameters fetched from SSM Parameter Store

## Local Testing

For local testing outside of GitHub Actions, see `tests/workflows/test-action.yml`, designed for use with the GitHub Actions runner simulator [Act](https://github.com/nektos/act):

```
act -j local-test -W tests/workflows/test-action.yml
```

## Workflow Advantages

This parallel workflow architecture offers several benefits:

1. **Speed**: Tests run concurrently, completing faster than a sequential approach
2. **Isolation**: Each test type runs independently, avoiding cross-contamination
3. **Clarity**: Results are clearly separated by test type
4. **Efficiency**: Failed tests in one area don't prevent others from running
5. **Scalability**: Easy to add new test types without restructuring existing workflows