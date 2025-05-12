# Setup Chamber and Fetch AWS SSM Parameters

[![Code Quality](https://github.com/anudeepsamaiya/chamber-aws-ssm-parameter-store/actions/workflows/code-quality.yml/badge.svg)](https://github.com/anudeepsamaiya/chamber-aws-ssm-parameter-store/actions/workflows/code-quality.yml)
[![Functional Tests](https://github.com/anudeepsamaiya/chamber-aws-ssm-parameter-store/actions/workflows/functional-tests.yml/badge.svg)](https://github.com/anudeepsamaiya/chamber-aws-ssm-parameter-store/actions/workflows/functional-tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

GitHub Action that securely retrieves AWS SSM parameters using [Chamber](https://github.com/segmentio/chamber) and exports them as environment variables in your workflow.

## Features

- Automatic Chamber installation
- Custom environment variable mappings
- Namespace control for parameters
- Works with standard AWS credential configurations

## Inputs

| **Input**               | **Description**                                                                                   | **Required** | **Default**                 |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ------------ | --------------------------- |
| `parameters`            | List of SSM parameters with optional custom mappings (e.g., `/my-app/db-password:MY_DB_PASSWORD`) | Yes          | N/A                         |
| `namespaced`            | Include namespace from parameter path in variable name (`true`/`false`)                           | No           | `true`                      |
| `aws-region`            | AWS region for SSM parameters                                                                     | No           | `us-east-1`                 |
| `aws-access-key-id`     | AWS access key ID                                                                                 | No           | (via environment variables) |
| `aws-secret-access-key` | AWS secret access key                                                                             | No           | (via environment variables) |
| `chamber_version`       | Chamber version to install (`2.10.12`, `latest`, etc.)                                            | No           | `2.10.12`                   |

## Parameter Naming

How parameters are mapped to environment variable names:

### With Namespacing (`namespaced: true`):

- Parameter `/my-app/db-password` → Environment variable `MY_APP_DB_PASSWORD`
- Parameter `/service/api-key` → Environment variable `SERVICE_API_KEY`

### Without Namespacing (`namespaced: false`):

- Parameter `/my-app/db-password` → Environment variable `DB_PASSWORD`
- Parameter `/service/api-key` → Environment variable `API_KEY`

### Custom Names:

- Parameter `/my-app/db-password:CUSTOM_NAME` → Environment variable `CUSTOM_NAME`

## Usage Examples

### Basic Usage

```yaml
- name: Fetch SSM Parameters
  uses: anudeepsamaiya/chamber-aws-ssm-parameter-store@v1
  with:
    parameters: |
      /my-app/db-password
      /my-app/api-key
```

### With Credentials

```yaml
- name: Fetch SSM Parameters
  uses: anudeepsamaiya/chamber-aws-ssm-parameter-store@v1
  with:
    parameters: |
      /my-app/db-password
      /my-app/api-key
    aws-region: us-west-2
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Without Namespacing

```yaml
- name: Fetch SSM Parameters
  uses: anudeepsamaiya/chamber-aws-ssm-parameter-store@v1
  with:
    parameters: |
      /my-app/db-password
      /my-app/api-key
    namespaced: 'false'
```

### With Custom Variable Names

```yaml
- name: Fetch SSM Parameters
  uses: anudeepsamaiya/chamber-aws-ssm-parameter-store@v1
  with:
    parameters: |
      /my-app/db-password:DATABASE_PASSWORD
      /my-app/api-key:API_SECRET
```

### With Specific Chamber Version

```yaml
- name: Fetch SSM Parameters
  uses: anudeepsamaiya/chamber-aws-ssm-parameter-store@v1
  with:
    parameters: |
      /my-app/db-password
    chamber_version: '2.10.12'  # or 'latest' for the newest release
```

## Complete Workflow Example

```yaml
name: Deploy with SSM Parameters

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      # Configure AWS credentials (recommended approach)
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      # Fetch parameters from SSM
      - name: Fetch SSM Parameters
        uses: anudeepsamaiya/chamber-aws-ssm-parameter-store@v1
        with:
          parameters: |
            /my-app/db-password
            /my-app/api-key:API_SECRET_KEY
          namespaced: 'true'

      # Use the parameters in subsequent steps
      - name: Deploy application
        run: |
          echo "Deploying with database password: $MY_APP_DB_PASSWORD"
          echo "Using API key: $API_SECRET_KEY"
          # Your deployment commands here
```

## AWS Credentials

The action supports various ways of providing AWS credentials:

1. **Using aws-actions/configure-aws-credentials (Recommended)**:
   ```yaml
   - name: Configure AWS credentials
     uses: aws-actions/configure-aws-credentials@v2
     with:
       aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
       aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
       aws-region: us-east-1
   ```

2. **Direct Input Parameters**:
   ```yaml
   - name: Fetch SSM Parameters
     uses: anudeepsamaiya/chamber-aws-ssm-parameter-store@v1
     with:
       parameters: |
         /my-app/db-password
       aws-region: us-east-1
       aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
       aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
   ```

3. **Environment Variables**:
   The action will automatically use `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` if they are set in the workflow environment.

## Development

### Requirements

- Docker and Docker Compose
- Node.js 18+

### Quick Start

```bash
git clone https://github.com/anudeepsamaiya/chamber-aws-ssm-parameter-store.git
cd chamber-aws-ssm-parameter-store
make test       # Run all tests
```

### Docker-based Development Environment

This project uses Docker Compose to provide a consistent development environment:

```bash
make docker-dev-env  # Start the Docker development environment
```

This will:
- Start a LocalStack container that simulates AWS services
- Start a test-runner container with Node.js
- Configure test parameters in LocalStack
- Set up necessary environment variables

### Testing

```bash
make test              # Run all tests (unit + integration) in Docker
make test-unit         # Run only unit tests in Docker
make test-integration  # Run only integration tests with LocalStack
make lint              # Run ESLint
make validate          # Validate action.yml format
```

### GitHub Workflows

This project uses optimized GitHub Actions workflows for testing and CI/CD:

1. **Code Quality** - Validates action configuration and runs linters
2. **Functional Tests** - Runs all test types:
   - Unit tests for isolated functionality
   - Integration tests with LocalStack
   - Configuration tests for different parameter setups
3. **Summary** - Aggregates results from other workflows
4. **Usage Example** - Demonstrates action usage in real workflows

To test locally with GitHub Actions:

```bash
make local-action-test  # Run the action locally using Act
```


## License

This GitHub Action is licensed under the MIT License.