#!/bin/bash
# Initialize AWS services in LocalStack for testing

# Wait for LocalStack to fully start
echo "Waiting for LocalStack services to start..."
while ! curl -s http://localhost:4566/health | grep -q '"running"'; do
  echo "Still waiting..."
  sleep 1
done

echo "LocalStack is ready! Setting up test environment..."

# Create test SSM parameters
echo "Creating test SSM parameters..."
aws --endpoint-url=http://localhost:4566 ssm put-parameter --name "/test-action/param1" --value "value1" --type String --overwrite
aws --endpoint-url=http://localhost:4566 ssm put-parameter --name "/test-action/param2" --value "value2" --type String --overwrite
aws --endpoint-url=http://localhost:4566 ssm put-parameter --name "/my-app/db-password" --value "db-password-123" --type SecureString --overwrite
aws --endpoint-url=http://localhost:4566 ssm put-parameter --name "/my-app/api-key" --value "api-key-xyz" --type SecureString --overwrite

echo "Test parameters created!"
aws --endpoint-url=http://localhost:4566 ssm get-parameters --names "/test-action/param1" "/test-action/param2" --with-decryption

echo "Test environment setup complete!"