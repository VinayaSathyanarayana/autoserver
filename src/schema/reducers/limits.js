'use strict';

const bytes = require('bytes');

const { throwError } = require('../../error');
const { getLimits } = require('../../limits');

// Validates `limits`
const validateLimits = function ({ schema }) {
  const {
    maxpayload,
    minMaxpayload,
    maxmodels,
    pagesize,
    maxActions,
  } = getLimits({ schema });

  validateMaxpayload({ maxpayload, minMaxpayload });

  validateMaxmodels({ maxmodels, pagesize, maxActions });

  return schema;
};

const validateMaxpayload = function ({ maxpayload, minMaxpayload }) {
  const maxpayloadA = bytes.parse(maxpayload);

  if (maxpayloadA === null || Number.isNaN(maxpayloadA)) {
    const message = '\'schema.limits.maxpayload\' must be a size in bytes, which can include "B", "KB", "MB", "GB" or "TB"';
    throwError(message, { reason: 'SCHEMA_VALIDATION' });
  }

  if (maxpayloadA < minMaxpayload) {
    const message = '\'schema.limits.maxpayload\' must be at least 100 bytes';
    throwError(message, { reason: 'SCHEMA_VALIDATION' });
  }
};

const validateMaxmodels = function ({ maxmodels, pagesize, maxActions }) {
  const isDisabled = pagesize === 0 || maxmodels === 0;

  // Second depth level actions must be allowed to have at least one item,
  // even when paginated
  const minMaxmodels = (maxActions - 1) * pagesize;
  const isValid = maxmodels >= minMaxmodels;

  if (isDisabled || isValid) { return; }

  const message = `'schema.limits.maxmodels' must be at least ${minMaxmodels}`;
  throwError(message, { reason: 'SCHEMA_VALIDATION' });
};

module.exports = {
  validateLimits,
};