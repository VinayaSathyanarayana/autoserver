'use strict';

// E.g. when a nested `args.data` is used, nested actions are created,
// but their return value should not be part of the output.
// Those actions will be present in the `results` array, but select will
// be `undefined`
const removeNestedWrite = function ({ results }) {
  const resultsA = results.filter(({ select }) => select);
  return { results: resultsA };
};

module.exports = {
  removeNestedWrite,
};
