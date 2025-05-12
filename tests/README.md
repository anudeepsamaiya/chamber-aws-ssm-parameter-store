# Testing Chamber AWS SSM Parameter Store Action

## Directory Structure

- `unit/`: Unit tests for parameter mapping
- `integration/`: Tests with AWS SSM Parameter Store
- `fixtures/`: Test data and mocks
- `workflows/`: GitHub workflow examples

## Running Tests

Tests run in Docker containers:

```bash
# From repository root
make test              # Run unit tests
make test-unit         # Same as above
```

### Local GitHub Action Testing

Test using [act](https://github.com/nektos/act):

```bash
# From repository root
make local-action-test
```

## Adding Tests

- Match existing test patterns in `unit/` or `integration/`
- Use fixtures from `fixtures/` directory
- Test parameter mapping in `parameter-mapping.test.js`

## Test Architecture

- **Unit Tests**: Jest for parameter mapping logic
- **Integration Tests**: AWS mock for SSM interaction
- **Workflow Tests**: LocalStack for end-to-end validation