'use strict';

const pluralize = require('pluralize');

const { throwError } = require('../../../error');
const { mapValues, getWordsList, intersection } = require('../../../utilities');

// Generic plugin factory
// It adds attributes to each collection, using `getAttributes(pluginOpts)`
// option which returns the attributes
const attributesPlugin = function ({ getAttributes = () => ({}) }) {
  return ({ schema, schema: { collections }, opts }) => {
    if (!collections) { return schema; }

    const newAttrs = getAttributes(opts);

    const collectionsA = mapValues(
      collections,
      (coll, collname) => getNewColl({ coll, collname, newAttrs }),
    );
    return { ...schema, collections: collectionsA };
  };
};

const getNewColl = function ({
  coll,
  coll: { attributes = {} },
  collname,
  newAttrs,
}) {
  validateAttrs({ attributes, collname, newAttrs });

  return { ...coll, attributes: { ...attributes, ...newAttrs } };
};

// Make sure plugin does not override user-defined attributes
const validateAttrs = function ({ attributes, collname, newAttrs }) {
  const attrNames = Object.keys(attributes);
  const newAttrNames = Object.keys(newAttrs);
  const alreadyDefinedAttrs = intersection(attrNames, newAttrNames);
  if (alreadyDefinedAttrs.length === 0) { return; }

  // Returns human-friendly version of attributes, e.g. 'attribute my_attr' or
  // 'attributes my_attr and my_other_attr'
  const attrsName = pluralize('attributes', newAttrNames.length);
  const attrsValue = getWordsList(newAttrNames, { op: 'and', quotes: true });
  const message = `In collection '${collname}', cannot override ${attrsName} ${attrsValue}`;
  throwError(message, { reason: 'SCHEMA_VALIDATION' });
};

module.exports = {
  attributesPlugin,
};
