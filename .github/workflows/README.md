# GitHub Action Workflows

This directory contains GitHub Actions workflows for testing and demonstrating the Chamber AWS SSM Parameter Store action.

## Workflows

### 1. Test (`test.yml`)

This workflow runs automated tests for the GitHub action. It runs automatically on pushes to the main branch and pull requests, or can be triggered manually.

The workflow includes:
- Validation & Unit Tests job:
  - Validates the action.yml structure
  - Runs linting checks
  - Runs unit tests
  
- Integration & Configuration Tests job:
  - Starts LocalStack for AWS SSM Parameter Store simulation
  - Runs integration tests against the LocalStack instance
  - Tests all parameter configurations:
    - Namespaced parameters (default)
    - Non-namespaced parameters
    - Custom parameter mappings

**To run manually:**
1. Go to the "Actions" tab in your GitHub repository
2. Select "Test" workflow
3. Click "Run workflow" and configure any input parameters

### 2. Usage Example (`use-chamber-fetch-ssm-secrets.yml`)

This workflow demonstrates how to use the Chamber AWS SSM Parameter Store action in your own workflows.

**Features demonstrated:**
- Setting up AWS credentials
- Fetching SSM parameters with different configurations
- Using the fetched parameters in subsequent workflow steps

**To run the example:**
1. Go to the "Actions" tab in your GitHub repository
2. Select "Usage Example" workflow
3. Click "Run workflow" and configure any input parameters

**Note:** The example workflow requires AWS credentials with permissions to access the SSM Parameter Store.

## Local Testing

For local testing, there is a dedicated workflow file in the `tests/workflows` directory:

- `test-action.yml`: Designed for testing with the GitHub Actions runner simulator [Act](https://github.com/nektos/act)

To run the local test:
```
act -j local-test -W tests/workflows/test-action.yml
```

This local test workflow:
- Sets up a LocalStack container
- Creates test parameters
- Tests all parameter configurations directly against the container

## Environment Variables

All workflows use environment variables for configuration:

- `AWS_ACCESS_KEY_ID`: AWS access key ID (set to "test" for LocalStack)
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key (set to "test" for LocalStack)
- `AWS_REGION`: AWS region (defaults to 'us-east-1')
- `TEST_PARAM_1`, `TEST_PARAM_2`: Test parameter paths
- `TEST_VALUE_1`, `TEST_VALUE_2`: Test parameter values