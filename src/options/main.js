'use strict';

const { newMonitoredReduce } = require('../perf');

const { availableInstructions } = require('./available');
const { loadMainConf } = require('./main_conf');
const { applyEnvVars } = require('./env');
const { loadSubConf } = require('./sub_conf');
const { applyDefaultOptions } = require('./default');
const { validateOptions } = require('./validate');

const processors = [
  loadMainConf,
  applyEnvVars,
  applyDefaultOptions,
  loadSubConf,
  validateOptions,
];

// Retrieve and validate main options
const getOptions = function ({ instruction, options, measures }) {
  const availableOpts = getAvailableOpts({ instruction });
  return newMonitoredReduce({
    funcs: processors,
    initialInput: { options, instruction, availableOpts, measures },
    mapResponse: (input, newInput) => ({ ...input, ...newInput }),
    category: `${instruction}_opts`,
  });
};

const getAvailableOpts = function ({ instruction }) {
  const { options: availableOpts } = availableInstructions
    .find(({ name }) => name === instruction);
  return availableOpts;
};

module.exports = {
  getOptions,
};
