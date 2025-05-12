# Makefile for chamber-aws-ssm-parameter-store GitHub Action

.PHONY: setup test test-unit test-integration lint validate clean help docker-test-env ensure-lock

# Variables
ACT ?= act
DOCKER ?= docker
NODE ?= node
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
	@echo "  test               Run all tests"
	@echo "  test-unit          Run unit tests only"
	@echo "  test-integration   Run integration tests only"
	@echo "  lint               Run linters"
	@echo "  validate           Validate action.yml format"
	@echo "  ensure-lock        Ensure package-lock.json exists"
	@echo "  docker-test-env    Start a Docker container with AWS mock environment"
	@echo "  local-action-test  Test the action locally using act"
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

# Run all tests
test: test-unit test-integration

# Run unit tests
test-unit:
	$(NPM) test

# Run integration tests with AWS mocked
test-integration:
	SKIP_AWS_TESTS=true $(NPM) run test:integration

# Run linters
lint:
	$(NPM) run lint

# Fix linting issues
lint-fix:
	$(NPM) run lint:fix

# Validate action.yml
validate:
	$(NPM) run validate

# Start Docker container with LocalStack for testing
docker-test-env:
	$(DOCKER) run -d --name localstack -p 4566:4566 -e SERVICES=ssm localstack/localstack:latest
	@echo "LocalStack is starting up..."
	@sleep 5
	@echo "Configure AWS CLI with: aws configure set endpoint_url http://localhost:4566"
	@echo "Test parameters with: aws --endpoint-url=http://localhost:4566 ssm put-parameter --name \"/test/param\" --value \"test-value\" --type String"
	@echo "Stop container with: docker stop localstack && docker rm localstack"

# Test GitHub Action locally using act
local-action-test:
	@if ! command -v $(ACT) > /dev/null; then \
		echo "Error: act is not installed. Install from https://github.com/nektos/act"; \
		exit 1; \
	fi
	$(ACT) -j test-action -W tests/workflows/test-action.yml

# Install chamber locally (for development/testing)
install-chamber:
	@echo "Installing Chamber version $(CHAMBER_VERSION)..."
	mkdir -p /tmp/chamber
	curl -sSL "https://github.com/segmentio/chamber/releases/download/v$(CHAMBER_VERSION)/chamber-v$(CHAMBER_VERSION)-$$(uname -s | tr '[:upper:]' '[:lower:]')-amd64" -o /tmp/chamber/chamber
	chmod +x /tmp/chamber/chamber
	sudo mv /tmp/chamber/chamber /usr/local/bin/chamber
	@echo "Chamber installed successfully. Run 'chamber version' to verify."

# Clean up temporary files
clean:
	rm -rf node_modules
	rm -rf coverage
	rm -rf .nyc_output
	find . -name "*.log" -type f -delete