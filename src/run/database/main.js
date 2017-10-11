'use strict';

const { databaseAdapters } = require('../../database');

const { getAdaptersMap } = require('./map');
const { validateDbOpts, validateUnusedAdapters } = require('./validate');

// Create database connections
const connectToDatabases = function ({
  runOpts,
  schema: { models: schemaModels },
}) {
  const adapters = getAdapters({ runOpts });

  validateDbOpts({ adapters, schemaModels });

  const adaptersMap = getAdaptersMap({ adapters, schemaModels });

  validateUnusedAdapters({ adapters, adaptersMap });
};

// Transform `runOpts.db` to array of adapters, by merging with them
const getAdapters = function ({ runOpts: { db = defaultDb } }) {
  return Object.entries(db).map(([type, { models = [], ...options }]) =>
    ({ ...databaseAdapters[type], type, models, options }));
};

// Default `runOpts.db` options if none is specified
const defaultDb = {
  memory: {},
};

module.exports = {
  connectToDatabases,
};
