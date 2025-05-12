/**
 * Integration tests for AWS SSM Parameter Store
 * 
 * NOTE: These tests require AWS credentials with SSM access to be set up.
 * Run with SKIP_AWS_TESTS=true to skip actual AWS calls.
 */

const { SSMClient, GetParameterCommand, PutParameterCommand, DeleteParameterCommand } = require('@aws-sdk/client-ssm');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Skip all tests if SKIP_AWS_TESTS is set
const skipTests = process.env.SKIP_AWS_TESTS === 'true';
const testRegion = process.env.AWS_REGION || 'us-east-1';

// Unique test parameter paths to avoid conflicts
const TEST_PARAM_PREFIX = '/test-chamber-action';
const TEST_PARAM_1 = `${TEST_PARAM_PREFIX}/test-param-1`;
const TEST_PARAM_2 = `${TEST_PARAM_PREFIX}/test-param-2`;

// Create SSM client
const ssmClient = new SSMClient({ region: testRegion });

describe('AWS SSM Integration Tests', () => {
  // Skip all tests if SKIP_AWS_TESTS is true
  if (skipTests) {
    it.skip('AWS integration tests skipped', () => {});
    return;
  }

  // Setup test parameters in AWS SSM
  beforeAll(async () => {
    // Create test parameters
    try {
      await ssmClient.send(new PutParameterCommand({
        Name: TEST_PARAM_1,
        Value: 'test-value-1',
        Type: 'String',
        Overwrite: true
      }));

      await ssmClient.send(new PutParameterCommand({
        Name: TEST_PARAM_2,
        Value: 'test-value-2',
        Type: 'String',
        Overwrite: true
      }));
    } catch (error) {
      console.error('Failed to create test parameters:', error);
      throw error;
    }
  });

  // Clean up test parameters
  afterAll(async () => {
    try {
      await ssmClient.send(new DeleteParameterCommand({ Name: TEST_PARAM_1 }));
      await ssmClient.send(new DeleteParameterCommand({ Name: TEST_PARAM_2 }));
    } catch (error) {
      console.error('Failed to clean up test parameters:', error);
    }
  });

  // Create a temporary test script to simulate action behavior 
  const testScriptPath = path.join(__dirname, '..', 'fixtures', 'chamber-test.sh');
  
  beforeEach(() => {
    const testScript = `
#!/bin/bash
# This script simulates the chamber command behavior for testing

# Simulate chamber read command
chamber_read() {
  local param=$1
  
  # Use AWS CLI to get the parameter
  aws ssm get-parameter --name "$param" --with-decryption --query "Parameter.Value" --output text
}

# Run the test with parameters
chamber_read "$1"
`;
    fs.writeFileSync(testScriptPath, testScript, { mode: 0o755 });
  });

  afterEach(() => {
    try {
      fs.unlinkSync(testScriptPath);
    } catch (error) {
      console.error('Failed to clean up test script:', error);
    }
  });

  // Test retrieving parameters with the simulated chamber command
  it('should fetch parameters using simulated chamber', async () => {
    // Get parameter values using AWS SDK for verification
    const getParam1 = await ssmClient.send(new GetParameterCommand({ 
      Name: TEST_PARAM_1,
      WithDecryption: true
    }));
    
    // Execute the test script that simulates chamber behavior
    const result = execSync(`${testScriptPath} ${TEST_PARAM_1}`, { encoding: 'utf8' });
    
    expect(result.trim()).toBe(getParam1.Parameter.Value);
  });

  // Test that parameter values match expected values
  it('should match expected parameter values', async () => {
    // Get all test parameters
    const getParam1 = await ssmClient.send(new GetParameterCommand({ Name: TEST_PARAM_1, WithDecryption: true }));
    const getParam2 = await ssmClient.send(new GetParameterCommand({ Name: TEST_PARAM_2, WithDecryption: true }));
    
    expect(getParam1.Parameter.Value).toBe('test-value-1');
    expect(getParam2.Parameter.Value).toBe('test-value-2');
  });
});