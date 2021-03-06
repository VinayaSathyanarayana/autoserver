import { getPagesize } from './info.js'

// Whether request will be paginated
export const willPaginate = function({
  args,
  command,
  commandpath,
  top,
  config,
}) {
  // Only for top-level findMany, and patchMany (its currentData `find` command)
  return (
    commandpath === '' &&
    PAGINATION_TOP_COMMANDS.includes(top.command.name) &&
    PAGINATION_COMMANDS.includes(command) &&
    !isPaginationDisabled({ config, args })
  )
}

const PAGINATION_TOP_COMMANDS = ['findMany', 'patchMany']
const PAGINATION_COMMANDS = ['find']

// Using args.pagesize 0 or pagesize 0 disables pagination
const isPaginationDisabled = function({ config, args }) {
  const pagesize = getPagesize({ args, config })
  return pagesize === 0
}

// `patch` commands can only iterate forward, as pagination is here only
// meant for database load controlling, not as a client feature.
// This means:
//  - offset pagination is not available
//  - backward cursor pagination is not available
export const isOnlyForwardCursor = function({ top }) {
  return FORWARD_TOP_COMMANDS.includes(top.command.name)
}

const FORWARD_TOP_COMMANDS = ['patchMany']
