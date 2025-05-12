/**
 * AWS SSM mock utilities for testing
 */
const awsMock = require('aws-sdk-mock');
const mockParameters = require('../fixtures/ssm-parameters.json');

/**
 * Set up mock for AWS SSM operations
 */
function setupSSMMock() {
  // Mock the SSM getParameter operation
  awsMock.mock('SSM', 'getParameter', (params, callback) => {
    const paramName = params.Name;
    const paramData = mockParameters[paramName];
    
    if (!paramData) {
      return callback(new Error(`Parameter ${paramName} not found`));
    }
    
    return callback(null, {
      Parameter: {
        Name: paramName,
        Type: paramData.type || 'String',
        Value: paramData.value,
        Version: 1,
        LastModifiedDate: new Date(),
        ARN: `arn:aws:ssm:us-east-1:123456789012:parameter${paramName}`
      }
    });
  });
}

/**
 * Reset all AWS mocks
 */
function resetSSMMock() {
  awsMock.restore('SSM');
}

module.exports = {
  setupSSMMock,
  resetSSMMock
};