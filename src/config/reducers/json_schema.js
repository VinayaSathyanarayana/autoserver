import { pickBy, omit } from '../../utils/functional/filter.js'
import { mapValues } from '../../utils/functional/map.js'
import { addGenErrorHandler } from '../../errors/handler.js'
import { compile } from '../../validation/compile.js'

// Compile JSON schema defined in the config
// Returns compiled JSON schema of:
//   { coll: { type: 'object', required: [...], properties: { ... } }
export const compileJsonSchema = function({
  config,
  config: { collections, shortcuts },
}) {
  const validateMap = mapValues(collections, ({ attributes }, collname) =>
    compileCollection({ attributes, config, collname }),
  )

  return { shortcuts: { ...shortcuts, validateMap } }
}

const compileCollection = function({ attributes, config, collname }) {
  const jsonSchemaA = mappers.reduce(
    (jsonSchema, mapper) => mapper({ jsonSchema }),
    attributes,
  )
  const jsonSchemaB = eCompileSchema({
    config,
    jsonSchema: jsonSchemaA,
    collname,
  })
  return jsonSchemaB
}

// From `attr.validate` to `{ type: 'object', properties }`
const attrsToJsonSchema = function({ jsonSchema }) {
  const properties = mapValues(jsonSchema, ({ validate }) => validate)

  return { type: 'object', properties }
}

// Fix `required` attribute according to the current command
// JSON schema `require` attribute is a collection-level array,
// not an attribute-level boolean
const addJsonSchemaRequire = function({
  jsonSchema,
  jsonSchema: { properties },
}) {
  const requiredAttrs = pickBy(properties, ({ required }) => required)
  const requiredA = Object.keys(requiredAttrs)
  // `id` requiredness is checked by other validators, so we skip it here
  const requiredB = requiredA.filter(attrName => attrName !== 'id')
  return { ...jsonSchema, required: requiredB }
}

// JSON schema `dependencies` attribute is collection-level, not attribute-level
const addJsonSchemaDeps = function({ jsonSchema, jsonSchema: { properties } }) {
  const dependenciesA = mapValues(
    properties,
    ({ dependencies }) => dependencies,
  )
  const dependenciesB = pickBy(dependenciesA, dep => dep !== undefined)
  return { ...jsonSchema, dependencies: dependenciesB }
}

// Remove syntax that is not JSON schema
const removeAltSyntax = function({ jsonSchema, jsonSchema: { properties } }) {
  const propertiesA = mapValues(properties, attr => omit(attr, NON_JSON_SCHEMA))
  return { ...jsonSchema, properties: propertiesA }
}

const NON_JSON_SCHEMA = ['required', 'dependencies']

const mappers = [
  attrsToJsonSchema,
  addJsonSchemaRequire,
  addJsonSchemaDeps,
  removeAltSyntax,
]

const compileSchema = function({ config, jsonSchema }) {
  return compile({ config, jsonSchema })
}

const eCompileSchema = addGenErrorHandler(compileSchema, {
  message: ({ collname }) =>
    `Invalid JSON schema in 'validate' property of '${collname}' collection`,
  reason: 'CONFIG_VALIDATION',
})
