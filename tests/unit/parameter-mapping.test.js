/**
 * Unit tests for parameter mapping functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sinon = require('sinon');

// Helper function to get the expected environment variable name
function getExpectedEnvName(paramPath, isNamespaced, customName = '') {
  if (customName) return customName;

  if (isNamespaced) {
    // Extract namespace (first part after removing leading slash)
    const namespace = paramPath.replace(/^\//, '').split('/')[0].toUpperCase();
    
    // Get parameter name (last part after the last slash)
    const paramName = paramPath.split('/').pop().toUpperCase();
    
    return `${namespace}_${paramName}`;
  } else {
    // Just the parameter name (last part after the last slash)
    return paramPath.split('/').pop().toUpperCase();
  }
}

describe('Parameter Mapping Tests', () => {
  // Create a temporary test script that simulates the action's parameter mapping logic
  const testScriptPath = path.join(__dirname, '..', 'fixtures', 'test-mapping.sh');
  
  beforeAll(() => {
    // Create a test script that simulates the parameter mapping logic from action.yml
    const testScript = `
#!/bin/bash

# Function to simulate parameter mapping
map_param() {
  local param=$1
  local is_namespaced=$2
  local custom_env_var=$3

  # Extract the prefix (namespace) from the parameter (first part before the slash)
  prefix=$(echo "$param" | sed 's|/||' | cut -d'/' -f1 | tr 'a-z' 'A-Z')
  
  # Extract param name (last part after the last slash)
  param_name=$(echo "$param" | sed 's|.*/||' | tr 'a-z' 'A-Z')

  # Handle custom logic similar to action.yml
  if [[ "$is_namespaced" == "false" && -n "$custom_env_var" ]]; then
    echo "$custom_env_var"
  elif [[ "$is_namespaced" == "false" ]]; then
    echo "$param_name"
  else
    echo "${prefix}_${param_name}"
  fi
}

# Export the function
export -f map_param
`;

    // Create the test script
    fs.writeFileSync(testScriptPath, testScript, { mode: 0o755 });
  });

  afterAll(() => {
    // Clean up the test script
    fs.unlinkSync(testScriptPath);
  });

  test('should map parameters with namespacing', () => {
    const testCases = [
      { param: '/my-app/db-password', expected: 'MY_APP_DB_PASSWORD' },
      { param: '/service/api-key', expected: 'SERVICE_API_KEY' },
      { param: '/config/settings/feature-flag', expected: 'CONFIG_FEATURE_FLAG' }
    ];

    testCases.forEach(({ param, expected }) => {
      const result = execSync(`source ${testScriptPath} && map_param "${param}" "true" ""`, 
                             { shell: '/bin/bash' }).toString().trim();
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
      const result = execSync(`source ${testScriptPath} && map_param "${param}" "false" ""`, 
                             { shell: '/bin/bash' }).toString().trim();
      expect(result).toBe(expected);
    });
  });

  test('should map parameters with custom variable names', () => {
    const testCases = [
      { param: '/my-app/db-password', custom: 'MY_DB_PASSWORD', expected: 'MY_DB_PASSWORD' },
      { param: '/service/api-key', custom: 'API_SECRET', expected: 'API_SECRET' }
    ];

    testCases.forEach(({ param, custom, expected }) => {
      const result = execSync(`source ${testScriptPath} && map_param "${param}" "false" "${custom}"`, 
                             { shell: '/bin/bash' }).toString().trim();
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
});