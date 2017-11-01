'use strict';

const { assignArray, mergeArrayReducer } = require('../../utilities');
const { mergeCommandPaths } = require('../action/command_paths');

const { getArgs } = require('./args');
const { getResults } = require('./results');

// Fire all commands associated with a set of write actions
const sequenceWrite = async function ({ actions, ...mInput }, nextLayer) {
  const actionsGroups = getWriteActions({ actions });

  // Run write commands in parallel
  const resultsPromises = actionsGroups
    .map(actionsA => singleWrite({ actions: actionsA, mInput, nextLayer }));
  const results = await Promise.all(resultsPromises);

  const resultsA = results.reduce(assignArray, []);
  return { results: resultsA };
};

// Group actions by model
const getWriteActions = function ({ actions }) {
  const actionsGroups = actions.reduce(mergeArrayReducer('modelName'), {});
  const actionsGroupsA = Object.values(actionsGroups);
  const actionsGroupsB = mergeCommandPaths({ actionsGroups: actionsGroupsA });
  return actionsGroupsB;
};

const singleWrite = async function ({
  actions,
  actions: [{ modelName }],
  mInput,
  mInput: { top },
  nextLayer,
}) {
  const { args, ids } = getArgs({ actions, top });

  // No model to modify, so can return right away
  if (ids.length === 0) { return []; }

  const results = await fireWriteCommand({ actions, args, nextLayer, mInput });

  const resultsA = getResults({ actions, results, ids, modelName });
  return resultsA;
};

// Fire actual write command
const fireWriteCommand = async function ({
  actions: [{ modelName, commandPath }],
  args,
  nextLayer,
  mInput,
  mInput: { top: { command: { type: command } } },
}) {
  const mInputA = { ...mInput, commandPath, command, modelName, args };
  const { response: { data: results } } = await nextLayer(mInputA, 'command');
  return results;
};

module.exports = {
  sequenceWrite,
};