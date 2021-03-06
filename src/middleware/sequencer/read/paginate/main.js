import { getNestedAttrs } from './attr.js'
import { getNestedPagesize } from './pagesize.js'
import { truncateAttrs } from './truncate.js'

// Paginates nested find commands, to ensure response does not hit `maxmodels`
// limit
export const paginateResults = function({
  results,
  maxmodels,
  top,
  isTopLevel,
  childActions,
}) {
  const shouldPaginate = shouldPaginateResults({
    results,
    maxmodels,
    top,
    isTopLevel,
  })

  if (!shouldPaginate) {
    return
  }

  const nestedAttrs = getNestedAttrs({ childActions })
  const nestedPagesize = getNestedPagesize({ results, nestedAttrs, maxmodels })

  if (nestedPagesize === Infinity) {
    return
  }

  const resultsA = truncateAttrs({ results, nestedAttrs, nestedPagesize })

  // eslint-disable-next-line fp/no-mutating-methods
  results.splice(0, results.length, ...resultsA)
}

const shouldPaginateResults = function({ maxmodels, top, isTopLevel }) {
  // Only depth level 2 is paginated, since deeper levels cannot use findMany
  // commands
  return (
    isTopLevel &&
    maxmodels !== Infinity &&
    COMMAND_TYPES.includes(top.command.type)
  )
}

const COMMAND_TYPES = ['find']
