'use strict';

const { mapAttrs } = require('../helpers');

// Copy `attr.type|description` to nested collections
// from the `coll.id` they refer to
const mergeNestedColl = function ({ schema }) {
  return mapAttrs({ func: mapAttr, schema });
};

const mapAttr = function ({ attr, schema: { collections } }) {
  if (attr.target === undefined) { return attr; }

  const [, collA] = Object.entries(collections).find(([name, coll]) =>
    coll.collname === attr.target || name === attr.target);

  const { type } = collA.attributes.id;
  const description = attr.description || collA.description;

  return { ...attr, type, description };
};

module.exports = {
  mergeNestedColl,
};