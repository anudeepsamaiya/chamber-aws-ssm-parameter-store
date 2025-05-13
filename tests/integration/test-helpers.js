/**
 * Integration test helpers
 */

/**
 * Parameter mapping functions (duplicated from production code for testing)
 */
function getNamespaced(param) {
  const prefix = param.replace(/^\//, '').split('/')[0].toUpperCase().replace(/-/g, '_');
  const name = param.replace(/.*\//, '').toUpperCase().replace(/-/g, '_');
  return `${prefix}_${name}`;
}

function getNonNamespaced(param) {
  return param.replace(/.*\//, '').toUpperCase().replace(/-/g, '_');
}

/**
 * Helper function to test parameter mapping without conditional expects
 */
function testParameterMapping(param, namespaced, expected) {
  if (namespaced) {
    const result = getNamespaced(param);
    expect(result).toBe(expected);
  } else {
    const result = getNonNamespaced(param);
    expect(result).toBe(expected);
  }
}

/**
 * Skip tests if not in Docker environment
 */
function skipIfNotInDocker() {
  if (!process.env.DOCKER_ENV) {
    console.warn('Skipping test: Not in Docker environment');
    return true;
  }
  return false;
}

module.exports = {
  getNamespaced,
  getNonNamespaced,
  testParameterMapping,
  skipIfNotInDocker,
  TEST_PREFIX: '/test-action'
};