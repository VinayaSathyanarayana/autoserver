import { set } from '../../utils/functional/get_set.js'

// Merge all `results` into a single nested response, using `result.path`
export const assembleResults = function({ results, top: { command } }) {
  const response = command.multiple ? [] : {}
  const responseA = results.reduce(assembleResult, response)
  return { response: responseA }
}

const assembleResult = function(response, { model, path }) {
  return set(response, path, model)
}
