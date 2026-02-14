// validators/index.js
// Lightweight input validation helpers for the Blade Dance API.
// No external dependencies — keeps the project minimal and reusable.

/**
 * Validate that a value is a non-empty string.
 * @param {*} value - Value to check
 * @param {string} fieldName - Name of the field (for error messages)
 * @returns {{ valid: boolean, error?: string }}
 */
function requireString(value, fieldName) {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required and must be a non-empty string` };
  }
  return { valid: true };
}

/**
 * Validate that a value is a valid Injective wallet address.
 * Injective addresses start with 'inj1' and are 42 characters long.
 * @param {string} address - Address to validate
 * @returns {{ valid: boolean, error?: string }}
 */
function validateWalletAddress(address) {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Wallet address is required' };
  }
  if (!address.startsWith('inj1')) {
    return { valid: false, error: 'Wallet address must start with inj1' };
  }
  if (address.length !== 42) {
    return { valid: false, error: 'Wallet address must be 42 characters long' };
  }
  return { valid: true };
}

/**
 * Validate that a value is a non-empty array.
 * @param {*} value - Value to check
 * @param {string} fieldName - Name of the field (for error messages)
 * @returns {{ valid: boolean, error?: string }}
 */
function requireArray(value, fieldName) {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return { valid: false, error: `${fieldName} is required and must be a non-empty array` };
  }
  return { valid: true };
}

/**
 * Validate that a value is one of the allowed values.
 * @param {*} value - Value to check
 * @param {string[]} allowed - Allowed values
 * @param {string} fieldName - Name of the field (for error messages)
 * @returns {{ valid: boolean, error?: string }}
 */
function requireOneOf(value, allowed, fieldName) {
  if (!allowed.includes(value)) {
    return { valid: false, error: `${fieldName} must be one of: ${allowed.join(', ')}` };
  }
  return { valid: true };
}

/**
 * Validate that a value is a positive number.
 * @param {*} value - Value to check
 * @param {string} fieldName - Name of the field (for error messages)
 * @returns {{ valid: boolean, error?: string }}
 */
function requirePositiveNumber(value, fieldName) {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: `${fieldName} must be a positive number` };
  }
  return { valid: true };
}

module.exports = {
  requireString,
  validateWalletAddress,
  requireArray,
  requireOneOf,
  requirePositiveNumber
};
