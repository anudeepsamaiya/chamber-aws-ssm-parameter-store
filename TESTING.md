# Testing Structure

This document explains the GitHub Actions workflow structure used for testing this repository.

## Workflow Structure

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

## Testing Locally

To test the GitHub Action locally:

1. Install [nektos/act](https://github.com/nektos/act)
2. Run the local testing workflow:
   ```bash
   act -j test-action -W tests/workflows/test-action.yml
   ```

## Best Practices

When modifying workflows:

1. Focus on updating the reusable workflows to minimize duplication
2. Ensure that changes to the main CI/CD pipeline maintain comprehensive testing
3. Keep the example workflow simple and focused on user education
4. Update the local testing workflow to reflect changes in the GitHub CI/CD setup