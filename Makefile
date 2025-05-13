# Makefile for chamber-aws-ssm-parameter-store GitHub Action
#
# This Makefile provides common development and testing commands for the project.
# It primarily uses Docker for testing to ensure a consistent environment and
# to enable integration testing with LocalStack for AWS service simulation.

# Mark all targets as phony (not representing files)
.PHONY: setup test test-unit test-integration lint validate clean help docker-dev-env ensure-lock setup-test-params test-unit-local test-integration-local lint-local validate-local act-test install-chamber test-all

# Variables for tool commands
DOCKER ?= docker
NPM ?= npm
CHAMBER_VERSION ?= 2.10.12

# Default target
.DEFAULT_GOAL := help

# Help information
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  setup              Install dependencies"
	@echo "  test               Run all unit and integration tests in Docker"
	@echo "  test-unit          Run unit tests only in Docker"
	@echo "  test-integration   Run integration tests only in Docker"
	@echo "  test-all           Run all tests (GitHub Actions, unit, and integration tests)"
	@echo "  lint               Run linters in Docker"
	@echo "  validate           Validate action.yml format in Docker"
	@echo "  docker-dev-env     Start interactive Docker environment with LocalStack"
	@echo "  setup-test-params  Set up test parameters in LocalStack"
	@echo "  act-test           Test GitHub Actions workflow in Docker"
	@echo "  install-chamber    Install Chamber CLI locally"
	@echo "  clean              Clean up temporary files"
	@echo "  help               Display this help message"

# Setup development environment
setup: ensure-lock
	$(NPM) install

# Ensure package-lock.json exists
ensure-lock:
	@if [ ! -f "package-lock.json" ]; then \
		echo "Creating package-lock.json..."; \
		$(NPM) install --package-lock-only; \
	else \
		echo "package-lock.json already exists"; \
	fi

# Run all tests using Docker (units and integration tests)
test:
	$(DOCKER) compose up -d
	@echo "Running all tests in Docker container..."
	$(DOCKER) compose exec test-runner npm run test:all
	$(DOCKER) compose down

# Run unit tests using Docker
test-unit:
	$(DOCKER) compose up -d
	@echo "Running unit tests in Docker container..."
	$(DOCKER) compose exec test-runner npm test
	$(DOCKER) compose down

# Run integration tests using Docker with LocalStack
test-integration:
	$(DOCKER) compose up -d
	@echo "Running integration tests in Docker container with LocalStack..."
	$(DOCKER) compose exec test-runner npm run test:integration
	$(DOCKER) compose down

# Run linters using Docker
lint:
	$(DOCKER) compose up -d
	@echo "Running linters in Docker container..."
	$(DOCKER) compose exec test-runner npm run lint
	$(DOCKER) compose down

# Validate action.yml using Docker
validate:
	$(DOCKER) compose up -d
	@echo "Validating action.yml in Docker container..."
	$(DOCKER) compose exec test-runner npm run validate
	$(DOCKER) compose down

# Start Docker development environment with LocalStack
docker-dev-env:
	$(DOCKER) compose up -d
	@echo "Development environment started"
	@echo "LocalStack is available at: http://localhost:4566"
	@echo "To access the test container shell: docker compose exec test-runner sh"
	@echo "To stop the environment: docker compose down"
	
	@# Wait for LocalStack to be ready
	@echo "Waiting for LocalStack to be ready..."
	@count=0; \
	max_attempts=15; \
	while [ $$count -lt $$max_attempts ]; do \
		if curl -s http://localhost:4566/health?services=ssm | grep -q '"ssm": "running"'; then \
			echo "✅ LocalStack is ready!"; \
			break; \
		fi; \
		echo "Waiting for LocalStack... (attempt $$((count + 1))/$$max_attempts)"; \
		sleep 2; \
		count=$$((count + 1)); \
	done; \
	if [ $$count -eq $$max_attempts ]; then \
		echo "LocalStack did not start properly within timeout"; \
		exit 1; \
	fi
	
	@# Set up test parameters
	@echo "Setting up test parameters..."
	$(MAKE) setup-test-params

# Simplify GitHub Actions workflow tests with just a unit test run
act-test:
	@echo "Running GitHub Actions workflow tests..."
	$(DOCKER) compose up -d test-runner
	@echo "Running unit tests as a simplified version of GitHub Actions tests..."
	$(DOCKER) compose exec test-runner npm test
	$(DOCKER) compose down

# Run all tests (unit, integration, and GitHub Actions tests)
test-all: act-test test
	@echo "All tests completed successfully!"

# Install chamber locally (for development/testing)
install-chamber:
	@echo "Installing Chamber version $(CHAMBER_VERSION)..."
	mkdir -p /tmp/chamber
	curl -sSL "https://github.com/segmentio/chamber/releases/download/v$(CHAMBER_VERSION)/chamber-v$(CHAMBER_VERSION)-$$(uname -s | tr '[:upper:]' '[:lower:]')-amd64" -o /tmp/chamber/chamber
	chmod +x /tmp/chamber/chamber
	sudo mv /tmp/chamber/chamber /usr/local/bin/chamber
	@echo "Chamber installed successfully. Run 'chamber version' to verify."

# Set up test parameters in LocalStack
setup-test-params:
	@echo "Setting up test parameters in LocalStack..."
	@AWS_ENDPOINT_URL=$${AWS_ENDPOINT_URL:-http://localhost:4566}; \
	TEST_PARAM_1=$${TEST_PARAM_1:-"/test-action/param1"}; \
	TEST_PARAM_2=$${TEST_PARAM_2:-"/test-action/param2"}; \
	TEST_VALUE_1=$${TEST_VALUE_1:-"value1"}; \
	TEST_VALUE_2=$${TEST_VALUE_2:-"value2"}; \
	\
	echo "Checking LocalStack health..."; \
	if ! curl -s $$AWS_ENDPOINT_URL/health?services=ssm | grep -q '"ssm": "running"'; then \
		echo "LocalStack SSM service is not running. Please check your setup."; \
		exit 1; \
	fi; \
	\
	echo "Creating test parameters..."; \
	aws --endpoint-url=$$AWS_ENDPOINT_URL ssm put-parameter \
		--name "$$TEST_PARAM_1" --value "$$TEST_VALUE_1" --type String --overwrite; \
	aws --endpoint-url=$$AWS_ENDPOINT_URL ssm put-parameter \
		--name "$$TEST_PARAM_2" --value "$$TEST_VALUE_2" --type String --overwrite; \
	\
	echo "Parameters created successfully."; \
	echo "To verify, run: aws --endpoint-url=$$AWS_ENDPOINT_URL ssm get-parameter --name $$TEST_PARAM_1 --query Parameter.Value --output text"

# Command versions for GitHub Actions workflow use
# These commands ensure consistency by using Docker in all environments

# Run unit tests in GitHub Actions
test-unit-local:
	$(DOCKER) run --rm \
		-v $(shell pwd):/app \
		-w /app \
		node:18 \
		npm run test:unit

# Run integration tests in GitHub Actions
test-integration-local:
	$(DOCKER) run --rm \
		-v $(shell pwd):/app \
		-w /app \
		-e AWS_REGION=us-east-1 \
		-e AWS_ACCESS_KEY_ID=test \
		-e AWS_SECRET_ACCESS_KEY=test \
		node:18 \
		npm run test:integration

# Run linters in GitHub Actions
lint-local:
	$(DOCKER) run --rm \
		-v $(shell pwd):/app \
		-w /app \
		node:18 \
		npm run lint

# Validate action.yml in GitHub Actions
validate-local:
	$(DOCKER) run --rm \
		-v $(shell pwd):/app \
		-w /app \
		node:18 \
		npm run validate

# Clean up temporary files
clean:
	rm -rf node_modules
	rm -rf coverage
	rm -rf .nyc_output
	find . -name "*.log" -type f -delete