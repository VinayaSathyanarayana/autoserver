'use strict';


const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
const { chain, omit } = require('lodash');
const uuidv4 = require('uuid/v4');

const { EngineError } = require('../../../../error');
const { memoize, stringify } = require('../../../../utilities');
const { testJsl } = require('../../../jsl');
const { getTypeName, getActionName } = require('./name');
const { getSubDef, isModel, isMultiple } = require('./utilities');
const { getArguments } = require('./arguments');


// Retrieves the GraphQL type for a given IDL definition
const getType = function (def, opts = {}) {
  return getField(def, opts).type;
};

// Retrieves a GraphQL field info for a given IDL definition, i.e. an object that can be passed to new
// GraphQLObjectType({ fields })
// Includes return type, resolve function, arguments, etc.
const getField = function (def, opts) {
  opts.inputObjectType = opts.inputObjectType || '';

  const fieldGetter = graphQLFieldGetters.find(possibleType => possibleType.condition(def, opts));
  if (!fieldGetter) {
    throw new EngineError(`Could not parse property into a GraphQL type: ${stringify(def)}`, {
      reason: 'GRAPHQL_WRONG_DEFINITION',
    });
  }

  let { type, args } = fieldGetter.value(def, opts);

  // Fields description|deprecation_reason are taken from IDL definition
  const { description, deprecationReason } = def;

	// Only for models, and not for argument types
  // Modifiers (Array and NonNull) retrieve their arguments from underlying type (i.e. `args` is already defined)
  if (isModel(def) && opts.inputObjectType === '' && !args) {
    // Builds types used for `data` and `filter` arguments
    const dataObjectType = getType(def, Object.assign({}, opts, { inputObjectType: 'data' }));
    const filterObjectType = getType(def, Object.assign({}, opts, { inputObjectType: 'filter' }));
    // Retrieves arguments
    args = getArguments(def, Object.assign(opts, { dataObjectType, filterObjectType }));
  }

  // Can only assign default to input data that is optional.
  // 'update' does not required anything, nor assign defaults
  let defaultValue;
  if (!opts.isRequired && opts.inputObjectType === 'data' && opts.action.actionType !== 'update') {
    // JSL only shows as 'DYNAMIC_VALUE' in schema
    defaultValue = testJsl({ value: def.default }) ? 'DYNAMIC_VALUE' : def.default;
  }

  const field = { type, description, deprecationReason, args, defaultValue };
  return field;
};

// Required field FieldGetter
const graphQLRequiredFieldGetter = function (def, opts) {
  // Goal is to avoid infinite recursion, i.e. without modification the same graphQLFieldGetter would be hit again
  opts = Object.assign({}, opts, { isRequired: false });
  const { type: subType, args } = getField(def, opts);
  const type = new GraphQLNonNull(subType);
  return { type, args };
};

// Array field FieldGetter
const graphQLArrayFieldGetter = function (def, opts) {
  const subDef = getSubDef(def);
  const { type: subType, args } = getField(subDef, opts);
  const type = new GraphQLList(subType);
  return { type, args };
};

/**
 * Memoize object type constructor in order to infinite recursion.
 * We use the type name, i.e.:
 *  - type name must differ everytime type might differ
 *  - in particular, at the moment, type name differ when inputObjectType, actionType or multiple changes
 * We also namespace with a UUID which is unique for each new call to `getSchema()`, to avoid leaking
 **/
const objectTypeSerializer = function ([ def, opts ]) {
  const typeName = getTypeName({ def, opts });
  opts.schemaId = opts.schemaId || uuidv4();
  return `${opts.schemaId}/${typeName}`;
};

// Object field FieldGetter
const graphQLObjectFieldGetter = memoize(function (def, opts) {
  const name = getTypeName({ def, opts });
  const description = def.description;
	const constructor = opts.inputObjectType !== '' ? GraphQLInputObjectType : GraphQLObjectType;
  const fields = getObjectFields(def, opts);

  const type = new constructor({ name, description, fields });
  return { type };
}, { serializer: objectTypeSerializer });

// Retrieve the fields of an object, using IDL definition
const getObjectFields = function (def, opts) {
  const { action = {}, inputObjectType } = opts;
  const { actionType, multiple } = action;
  // This needs to be function, otherwise we run in an infinite recursion, if the children try to reference a parent type
  return () => chain(def.properties)
    .transform((memo, childDef, childDefName) => {
      const subDef = getSubDef(childDef);

      // Only for nested models
      if (!(isModel(subDef) && !subDef.isTopLevel)) {
        memo[childDefName] = childDef;
        return memo;
      }

      // Copy nested models with a different name that includes the action, e.g. `my_attribute` -> `createMyAttribute`
      // Not for data|filter arguments
      if (inputObjectType === '') {
        const name = getActionName({ modelName: childDefName, actionType });
        memo[name] = childDef;
        // Add transformed name to `required` array, if non-transformed name was present
        if (def.required instanceof Array && def.required.includes(childDefName) && !def.required.includes(name)) {
          def.required.push(name);
        }
      }

      // Nested models use the regular name as well, but as simple ids, not recursive definition
      // Retrieves `id` field definition of subfield
      const nonRecursiveAttrs = ['description', 'deprecation_reason', 'examples'];
      const recursiveAttrs = ['model', 'type'];
      const idDef = Object.assign({}, omit(subDef.properties.id, nonRecursiveAttrs), omit(subDef, recursiveAttrs));
      // Consider this attribute as a normal attribute, not a model anymore
      delete idDef.model;

      // Assign `id` field definition to e.g. `model.user`
      const idsDef = isMultiple(childDef) ? Object.assign({}, childDef, { items: idDef }) : idDef;
      memo[childDefName] = idsDef;

      return memo;
    })
		.omitBy((childDef, childDefName) => {
      const subDef = getSubDef(childDef);
      // Remove all return value fields for delete actions, except the recursive ones and `id`
      // And except for delete filters
      return (actionType === 'delete' && !isModel(subDef) && childDefName !== 'id' && inputObjectType !== 'filter')
        // Filter arguments for single actions only include `id`
        || (childDefName !== 'id' && inputObjectType === 'filter' && !multiple)
        // Nested data arguments do not include `id`
        || (childDefName === 'id' && inputObjectType === 'data' && !def.isTopLevel)
        // Readonly fields cannot be specified as data argument
        || (inputObjectType === 'data' && childDef.readOnly)
        // updateOne|updateMany do not allow data.id
        || (actionType === 'update' && childDefName === 'id' && inputObjectType === 'data');
    })
		// Recurse over children
		.mapValues((childDef, childDefName) => {
			// if 'Query' or 'Mutation' objects, pass current action down to sub-fields, and top-level definition
      const childAction = childDef.action || action;
      const childOpts = Object.assign({}, opts, { action: childAction });

      childOpts.isRequired = isRequired(def, childDef, childDefName, childOpts);

			const field = getField(childDef, childOpts);
      return field;
		})
		.value();
};

// Returns whether a field is required
const isRequired = function (parentDef, def, name, { action: { actionType, multiple } = {}, inputObjectType }) {
  // Filter inputObjects `id` attribute is always required
  const isFilterId = name === 'id' && inputObjectType === 'filter' && !multiple;
  const shouldRequire = isFilterId
    // When user declared an attribute as required
    || (parentDef.required instanceof Array && parentDef.required.includes(name));
  const shouldNotRequire =
    // Query inputObjects do not require any attribute, except filter.id for single actions
    (inputObjectType === 'filter' && !isFilterId)
    // updateOne|updateMany does not require any attribute in input object
    || (inputObjectType === 'data' && actionType === 'update')
    // data.id is optional in createOne|createMany
    || (inputObjectType === 'data' && actionType === 'create' && name === 'id');
  return shouldRequire && !shouldNotRequire;
};

/**
 * Maps an IDL definition into a GraphQL field information, including type
 * The first matching one will be used, i.e. order matters: required modifier, then array modifier come first
 */
const graphQLFieldGetters = [

	// "Required" modifier type
  {
    condition: (def, opts) => opts.isRequired,
    value: graphQLRequiredFieldGetter,
  },

	// "Array" modifier type
  {
    condition: def => def.type === 'array',
    value: graphQLArrayFieldGetter,
  },

	// "Object" type
  {
    condition: def => def.type === 'object',
    value: graphQLObjectFieldGetter,
  },

	// "Int" type
  {
    condition: def => def.type === 'integer',
    value: () => ({ type: GraphQLInt }),
  },

	// "Float" type
  {
    condition: def => def.type === 'number',
    value: () => ({ type: GraphQLFloat }),
  },

	// "String" type
  {
    condition: def => def.type === 'string' || def.type === 'null',
    value: () => ({ type: GraphQLString }),
  },

	// "Boolean" type
  {
    condition: def => def.type === 'boolean',
    value: () => ({ type: GraphQLBoolean }),
  },

];


module.exports = {
  getType,
};
