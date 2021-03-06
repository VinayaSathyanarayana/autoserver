import { pick } from '../utils/functional/filter.js'
import { mapValues } from '../utils/functional/map.js'
import { SYSTEM_PARAMS } from '../functions/params/system.js'

// Retrieve type and names of all possible `coll.authorize.*`
export const getAuthorizeAttrs = function({ config, collname }) {
  const serverParams = getServerParams({ config })
  const modelAttrs = getModelAttrs({ config, collname })
  return { ...serverParams, ...modelAttrs, ...SYSTEM_PARAMS }
}

// `coll.authorize.SERVERPARAM`
const getServerParams = function({ config: { params = {} } }) {
  return mapValues(params, () => ({ type: 'dynamic' }))
}

// `coll.authorize['model.ATTR']`
const getModelAttrs = function({ config: { collections }, collname }) {
  if (collname === undefined) {
    return
  }

  const { attributes = {} } = collections[collname]
  const modelAttrs = mapValues(attributes, attr =>
    pick(attr, ['type', 'isArray']),
  )
  return { model: modelAttrs }
}
