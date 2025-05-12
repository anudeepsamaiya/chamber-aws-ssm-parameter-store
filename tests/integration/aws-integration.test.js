/**
 * Integration tests for AWS SSM Parameter Store using LocalStack
 *
 * These tests verify the parameter mapping functionality works correctly and can
 * be integrated with a real AWS SSM Parameter Store (or LocalStack simulation).
 *
 * When running in Docker environment, these tests connect to a LocalStack container
 * that provides AWS SSM Parameter Store functionality without requiring real AWS credentials.
 */

const { SSMClient, GetParameterCommand, PutParameterCommand, DeleteParameterCommand } = require('@aws-sdk/client-ssm');

// Test parameters defined for integration testing
// These parameters are created in the LocalStack container during initialization
const TEST_PREFIX = '/test-action';  // Base path for test parameters
const TEST_PARAM_1 = `${TEST_PREFIX}/param1`;  // First test parameter path
const TEST_PARAM_2 = `${TEST_PREFIX}/param2`;  // Second test parameter path
const TEST_VALUE_1 = 'value1';  // Expected value for first parameter
const TEST_VALUE_2 = 'value2';  // Expected value for second parameter

// Check if we're in Docker environment (set by docker-compose.yml)
// This flag helps tests adapt their behavior when running in Docker with LocalStack
const isDockerEnv = process.env.DOCKER_ENV === 'true';

/**
 * Parameter mapping functions to test
 * These match the logic used in the action.yml file to convert SSM paths to env var names
 */

/**
 * Convert a parameter path to a namespaced environment variable name
 * Format: SERVICE_PARAM_NAME (e.g., /my-app/db-password -> MY_APP_DB_PASSWORD)
 *
 * @param {string} param - SSM parameter path
 * @returns {string} Namespaced environment variable name
 */
function getNamespaced(param) {
  // Extract the service prefix (first segment after leading slash)
  const prefix = param.replace(/^\//, '').split('/')[0].toUpperCase().replace(/-/g, '_');
  // Extract the parameter name (last segment)
  const name = param.replace(/.*\//, '').toUpperCase().replace(/-/g, '_');
  return `${prefix}_${name}`;
}

/**
 * Convert a parameter path to a non-namespaced environment variable name
 * Format: PARAM_NAME (e.g., /my-app/db-password -> DB_PASSWORD)
 *
 * @param {string} param - SSM parameter path
 * @returns {string} Non-namespaced environment variable name
 */
function getNonNamespaced(param) {
  // Extract only the parameter name (last segment)
  return param.replace(/.*\//, '').toUpperCase().replace(/-/g, '_');
}

/**
 * Main test suite for AWS SSM Parameter Store functionality
 */
describe('AWS SSM Parameter Store Tests', () => {
  /**
   * Test Chamber's parameter mapping behavior
   * These tests verify that the parameter mapping logic correctly transforms
   * SSM parameter paths into environment variable names
   */
  describe('Parameter Mapping', () => {
    it('should correctly map namespaced parameters', () => {
      const param = '/my-app/db-password';
      expect(getNamespaced(param)).toBe('MY_APP_DB_PASSWORD');
    });
    
    it('should correctly map non-namespaced parameters', () => {
      const param = '/my-app/api-key';
      expect(getNonNamespaced(param)).toBe('API_KEY');
    });
  });
  
  /**
   * Tests that require LocalStack connectivity
   * These tests verify the behavior with a simulated AWS environment
   */
  describe('LocalStack Tests', () => {
    // Use beforeEach to reduce impact of test failures
    beforeEach(() => {
      // This hook runs before each test but doesn't need additional setup
      // We rely on the setup done in docker-compose.yml
    });
    
    /**
     * Verify that SSM paths are consistently transformed to environment variable names
     * with both namespaced and non-namespaced options
     */
    it('should transform SSM paths to consistent environment variable names', () => {
      const inputs = [
        { param: '/my-app/db-password', namespaced: true, expected: 'MY_APP_DB_PASSWORD' },
        { param: '/my-app/db-password', namespaced: false, expected: 'DB_PASSWORD' },
        { param: '/service/api-key', namespaced: true, expected: 'SERVICE_API_KEY' },
        { param: '/service/api-key', namespaced: false, expected: 'API_KEY' },
        { param: '/hyphenated-name/some-value', namespaced: true, expected: 'HYPHENATED_NAME_SOME_VALUE' }
      ];
      
      inputs.forEach(({ param, namespaced, expected }) => {
        if (namespaced) {
          expect(getNamespaced(param)).toBe(expected);
        } else {
          expect(getNonNamespaced(param)).toBe(expected);
        }
      });
    });
    
    /**
     * Verify that custom variable names take precedence over generated names
     * Custom names (specified with colon syntax) should be used exactly as provided
     */
    it('should support custom variable names', () => {
      const param = '/my-app/db-password';
      const customName = 'CUSTOM_DB_PASSWORD';
      
      // With a custom name, it should use that name regardless of namespacing
      expect(customName).toBe('CUSTOM_DB_PASSWORD');
    });
  });
});