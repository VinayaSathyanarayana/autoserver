import { capitalize } from 'underscore.string'

import { mapValues, mapKeys } from '../../../../utils/functional/map.js'
import { COMMANDS } from '../../../../commands/constants.js'

import { getCommandName, getTypeName } from './name.js'
import { TOP_DESCRIPTIONS, getCommandDescription } from './description.js'

// Retrieve the GraphQL definitions for Query|Mutation,
// and the top-level commands
export const getTopDefs = function({ collections }) {
  return mapValues(GRAPHQL_METHODS, (commands, graphqlMethod) =>
    getTopDef({ graphqlMethod, commands, collections }),
  )
}

// Mapping from GraphQL methods to commands
const GRAPHQL_METHODS = {
  query: ['find'],
  mutation: ['create', 'upsert', 'patch', 'delete'],
}

const getTopDef = function({ collections, graphqlMethod, commands }) {
  const attributes = getCommandsDefs({ collections, commands })
  const collname = capitalize(graphqlMethod)
  const description = TOP_DESCRIPTIONS[graphqlMethod]

  const topDef = {
    type: 'object',
    attributes,
    collname,
    clientCollname: collname,
    description,
  }
  return topDef
}

// Retrieve attributes for a given GraphQL method
const getCommandsDefs = function({ collections, commands }) {
  const attributes = COMMANDS.map(({ type }) => type)
    .filter(type => commands.includes(type))
    .map(command => getCommandDef({ collections, command }))
  const attributesA = Object.assign({}, ...attributes)
  return attributesA
}

// Retrieve attributes for a given command
const getCommandDef = function({ collections, command }) {
  const collectionsA = getCollectionsNames({ collections })

  const collectionsB = mapValues(collectionsA, coll =>
    normalizeCollDef({ coll, command }),
  )

  // E.g. 'my_coll' + 'findMany' -> 'find_my_coll'
  // This will be used as the top-level graphqlMethod
  const collectionsC = mapKeys(collectionsB, getCommandName)
  return collectionsC
}

// Create one copy of a collection for each of its `clientCollname`
const getCollectionsNames = function({ collections }) {
  const collectionsA = Object.entries(collections).flatMap(getCollectionNames)
  const collectionsB = Object.assign({}, ...collectionsA)
  return collectionsB
}

const getCollectionNames = function([collname, coll]) {
  return coll.name.map(clientCollname => ({
    [clientCollname]: { ...coll, clientCollname, collname },
  }))
}

// Add command information to each top-level collection
const normalizeCollDef = function({ coll, command }) {
  const typeName = getTypeName({ def: coll })
  const commandDescription = getCommandDescription({ command, typeName })

  return { ...coll, command, commandDescription, type: 'object' }
}
