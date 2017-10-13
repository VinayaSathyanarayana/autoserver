'use strict';

const { uniq, intersection } = require('lodash');

const { getWordsList } = require('../../../utilities');
const { throwError } = require('../../../error');
const { crawlFilter } = require('../../../database');

// Adapter feature 'filter' allows for complex `args.filter`
const filterValidator = function ({ args, modelName }) {
  const ops = getFilterOps({ args });
  const opsA = intersection(ops, advancedFilterOps);
  if (opsA.length === 0) { return; }

  const message = getErrorMessage({ ops: opsA });
  const messageA = `In 'filter' argument, must not ${message} because the model '${modelName}' does not support it`;
  throwError(messageA, { reason: 'WRONG_KIND' });
};

const getFilterOps = function ({ args: { filter } }) {
  const ops = crawlFilter(filter, ({ type }) => type);
  const opsA = uniq(ops);
  return opsA;
};

const getErrorMessage = function ({ ops }) {
  if (ops.includes('or')) {
    return 'use an array of alternatives';
  }

  const opsA = getWordsList(ops, { op: 'nor', quotes: true });
  return `use the operators: ${opsA}`;
};

const advancedFilterOps = [
  'neq',
  'in',
  'nin',
  'like',
  'nlike',
  'all',
  'some',
  'or',
];

module.exports = {
  filterValidator,
};
