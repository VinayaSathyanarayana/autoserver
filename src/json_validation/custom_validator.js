'use strict';

const { runSchemaFunc, getModelVars } = require('../schema_func');
const { memoize } = require('../utilities');
const { throwError } = require('../error');

const { validator } = require('./validator');

// Add custom validation keywords, from schema.validation
const getCustomValidator = function ({ schema: { validation = {} } }) {
  return Object.entries(validation).reduce(
    (ajv, [keyword, { test: testFunc, message, type }]) =>
      addCustomKeyword({ ajv, keyword, testFunc, message, type }),
    validator,
  );
};

// We do want the re-run if schema.validation changes.
// Serializing the whole schema as is too slow, so we just take keywords list.
const mGetCustomValidator = memoize(getCustomValidator, {
  serializer: ({ schema: { validation = {} } }) =>
    `${Object.keys(validation).join(',')}`,
});

const addCustomKeyword = function ({ ajv, keyword, testFunc, message, type }) {
  // We name `null` `empty` in schema, as it is more YAML-friendly
  const typeA = type === 'empty' ? 'null' : type;

  validateCustomKeyword({ ajv, type: typeA, keyword });

  const validate = keywordFunc({ keyword, testFunc, message });
  ajv.addKeyword(keyword, { validate, type: typeA, $data: true });

  return ajv;
};

// eslint-disable-next-line max-params
const keywordFunc = ({ keyword, testFunc, message }) => function validate (
  expected,
  _,
  __,
  ___,
  model,
  attrName,
  { [Symbol.for('extra')]: { mInput, currentDatum: previousmodel } }
) {
  const modelVars = getModelVars({ model, attrName, previousmodel });
  const vars = { expected, ...modelVars };

  const isValid = runSchemaFunc({ schemaFunc: testFunc, mInput, vars });
  if (isValid === true) { return true; }

  const messageA = runSchemaFunc({ schemaFunc: message, mInput, vars });
  // eslint-disable-next-line fp/no-mutation
  validate.errors = [{
    message: messageA,
    keyword,
    params: { expected },
  }];

  return false;
};

const validateCustomKeyword = function ({ ajv, type, keyword }) {
  const isRedundant = Array.isArray(type) &&
    type.includes('number') &&
    type.includes('integer');
  if (!isRedundant) { return ajv; }

  const message = `Custom validation keyword 'schema.validation.${keyword}' must not have both types 'number' and 'integer', as 'number' includes 'integer'.`;
  throwError(message, { reason: 'SCHEMA_VALIDATION' });
};

module.exports = {
  getCustomValidator: mGetCustomValidator,
};
