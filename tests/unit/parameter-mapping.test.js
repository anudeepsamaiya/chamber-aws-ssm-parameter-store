/**
 * Unit tests for parameter mapping functionality
 */

// Helper function to get the expected environment variable name
function getExpectedEnvName(paramPath, isNamespaced, customName = '') {
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

// Helper function to simulate the parameter mapping from action.yml
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

describe('Parameter Mapping Tests', () => {
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