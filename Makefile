# Makefile for chamber-aws-ssm-parameter-store GitHub Action

.PHONY: setup test test-unit test-integration lint validate clean help docker-dev-env ensure-lock

# Variables
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
	@echo "  test               Run all tests"
	@echo "  test-unit          Run unit tests only"
	@echo "  test-integration   Run integration tests only"
	@echo "  lint               Run linters"
	@echo "  validate           Validate action.yml format"
	@echo "  ensure-lock        Ensure package-lock.json exists"
	@echo "  docker-dev-env     Start interactive Docker development environment with LocalStack"
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

# Run all tests using Docker (run only unit tests for now)
test:
	$(DOCKER) compose up -d
	@echo "Running tests in Docker container..."
	$(DOCKER) compose exec test-runner npm test
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

# Fix linting issues using Docker
lint-fix:
	$(DOCKER) compose up -d
	@echo "Fixing linting issues in Docker container..."
	$(DOCKER) compose exec test-runner npm run lint:fix
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