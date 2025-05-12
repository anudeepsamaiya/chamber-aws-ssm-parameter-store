# GitHub Action Workflows

This directory contains GitHub Actions workflows for testing and demonstrating the Chamber AWS SSM Parameter Store action.

## Optimized Workflow Architecture

We use a consolidated workflow architecture that balances parallelism with maintainability:

### Test Workflows

1. **Code Quality** (`code-quality.yml`)
   - Validates the action.yml structure and configuration
   - Runs ESLint to ensure code quality

2. **Functional Tests** (`functional-tests.yml`)
   - Unit Tests:
     - Fast tests that don't require external services
     - Verifies core functionality in isolation
   
   - Integration & Configuration Tests:
     - Sets up LocalStack for AWS SSM Parameter Store simulation
     - Runs integration tests against the LocalStack instance
     - Tests parameter configurations:
       - Namespaced parameters
       - Non-namespaced parameters 
       - Custom parameter mappings

3. **Test Summary** (`summary.yml`)
   - Aggregates results from other workflows
   - Provides a comprehensive test report

### Example Usage

- **Usage Example** (`usage-example.yml`)
  - Demonstrates how to use the action in real-world workflows
  - Shows how to access and use parameters fetched from SSM Parameter Store

## Local Testing

For local testing outside of GitHub Actions, use `tests/workflows/test-action.yml`, designed for use with the GitHub Actions runner simulator [Act](https://github.com/nektos/act):

```
act -j local-test -W tests/workflows/test-action.yml
```

## Workflow Advantages

This consolidated workflow architecture offers several benefits:

1. **Balance**: Perfect balance between parallelism and simplicity
2. **Organization**: Tests are grouped by functionality
3. **Clarity**: Results are clearly separated by test type
4. **Efficiency**: Reduced GitHub Actions usage without sacrificing speed
5. **Maintainability**: Fewer files to maintain with clear responsibilities