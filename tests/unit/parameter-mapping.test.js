/**
 * Unit tests for parameter mapping functionality
 *
 * These tests validate that the parameter mapping logic in action.yml works correctly
 * by simulating the parameter name transformation in JavaScript and verifying the
 * expected output for various input scenarios.
 */

/**
 * Helper function to get the expected environment variable name from a parameter path
 *
 * @param {string} paramPath - The SSM parameter path (e.g., "/my-app/db-password")
 * @param {boolean} isNamespaced - Whether to include namespace in the variable name
 * @param {string} customName - Optional custom name to use instead of generated name
 * @returns {string} The environment variable name
 */
function getExpectedEnvName(paramPath, isNamespaced, customName = '') {
  // If custom name is provided, it takes precedence over all transformations
  if (customName) return customName;

  if (isNamespaced) {
    // Extract namespace (first part after removing leading slash)
    const namespace = paramPath.replace(/^\//, '').split('/')[0].toUpperCase()
      .replace(/-/g, '_');

    // Get parameter name (last part after the last slash)
    const paramName = paramPath.split('/').pop().toUpperCase()
      .replace(/-/g, '_');

    return `${namespace}_${paramName}`;
  } else {
    // Just the parameter name (last part after the last slash)
    return paramPath.split('/').pop().toUpperCase()
      .replace(/-/g, '_');
  }
}

/**
 * Helper function to simulate the exact parameter mapping implementation from action.yml
 * This reproduces the bash logic used in the GitHub Action for mapping parameters
 *
 * @param {string} paramPath - The SSM parameter path (e.g., "/my-app/db-password")
 * @param {boolean} isNamespaced - Whether to include namespace in the variable name
 * @param {string} customName - Optional custom name to use instead of generated name
 * @returns {string} The environment variable name
 */
function mapParameterName(paramPath, isNamespaced, customName = '') {
  // If custom name is provided and not using namespacing, use custom name
  if (customName && !isNamespaced) {
    return customName;
  }
  
  // Extract the prefix (namespace) from the parameter (first part after removing leading slash)
  const prefix = paramPath.replace(/^\//, '').split('/')[0].toUpperCase()
    .replace(/-/g, '_');
  
  // Extract param name (last part after the last slash)
  const paramName = paramPath.split('/').pop().toUpperCase()
    .replace(/-/g, '_');
  
  // If not using namespacing, just use the parameter name
  if (!isNamespaced) {
    return paramName;
  }
  
  // Otherwise, use namespace + parameter name
  return `${prefix}_${paramName}`;
}

/**
 * Test suite for Parameter Mapping functionality
 *
 * These tests ensure that the parameter mapping logic accurately transforms SSM parameter paths
 * into environment variable names according to the GitHub Action's configuration options.
 */
describe('Parameter Mapping Tests', () => {
  /**
   * Test that parameters are correctly mapped with namespacing enabled
   * With namespacing, environment variables include the service prefix
   */
  test('should map parameters with namespacing', () => {
    const testCases = [
      { param: '/my-app/db-password', expected: 'MY_APP_DB_PASSWORD' },
      { param: '/service/api-key', expected: 'SERVICE_API_KEY' },
      { param: '/config/settings/feature-flag', expected: 'CONFIG_FEATURE_FLAG' }
    ];

    testCases.forEach(({ param, expected }) => {
      const result = mapParameterName(param, true, '');
      expect(result).toBe(expected);
    });
  });

  /**
   * Test that parameters are correctly mapped without namespacing
   * Without namespacing, only the parameter name is used (without service prefix)
   */
  test('should map parameters without namespacing', () => {
    const testCases = [
      { param: '/my-app/db-password', expected: 'DB_PASSWORD' },
      { param: '/service/api-key', expected: 'API_KEY' },
      { param: '/config/settings/feature-flag', expected: 'FEATURE_FLAG' }
    ];

    testCases.forEach(({ param, expected }) => {
      const result = mapParameterName(param, false, '');
      expect(result).toBe(expected);
    });
  });

  /**
   * Test that parameters with custom variable names are correctly mapped
   * Custom names should take precedence over generated names
   */
  test('should map parameters with custom variable names', () => {
    const testCases = [
      { param: '/my-app/db-password', custom: 'MY_DB_PASSWORD', expected: 'MY_DB_PASSWORD' },
      { param: '/service/api-key', custom: 'API_SECRET', expected: 'API_SECRET' }
    ];

    testCases.forEach(({ param, custom, expected }) => {
      const result = mapParameterName(param, false, custom);
      expect(result).toBe(expected);
    });
  });

  /**
   * Verify that our helper function produces expected variable names
   * Tests different combinations of namespacing and custom names
   */
  test('should use helper function to generate same variable names', () => {
    const testCases = [
      { param: '/my-app/db-password', namespaced: true, expected: 'MY_APP_DB_PASSWORD' },
      { param: '/my-app/db-password', namespaced: false, expected: 'DB_PASSWORD' },
      { param: '/my-app/db-password', namespaced: false, custom: 'CUSTOM_NAME', expected: 'CUSTOM_NAME' }
    ];

    testCases.forEach(({ param, namespaced, custom, expected }) => {
      const result = getExpectedEnvName(param, namespaced, custom);
      expect(result).toBe(expected);
    });
  });

  /**
   * Test that both helper functions (getExpectedEnvName and mapParameterName)
   * produce identical results for the same inputs
   */
  test('should match behavior between both helper functions', () => {
    const testCases = [
      { param: '/my-app/db-password', namespaced: true, custom: '' },
      { param: '/my-app/db-password', namespaced: false, custom: '' },
      { param: '/my-app/db-password', namespaced: false, custom: 'CUSTOM_NAME' }
    ];

    testCases.forEach(({ param, namespaced, custom }) => {
      const result1 = getExpectedEnvName(param, namespaced, custom);
      const result2 = mapParameterName(param, namespaced, custom);
      expect(result1).toBe(result2);
    });
  });
});