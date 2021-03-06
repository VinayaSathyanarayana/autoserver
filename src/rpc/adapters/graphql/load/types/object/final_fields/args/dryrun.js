import { GraphQLBoolean } from 'graphql'

// `dryrun` argument
export const getDryrunArgument = function({ command }) {
  const hasDryrun = DRYRUN_COMMANDS.includes(command)

  if (!hasDryrun) {
    return {}
  }

  return DRYRUN_ARGS
}

const DRYRUN_COMMANDS = ['create', 'upsert', 'patch', 'delete']

const DRYRUN_ARGS = {
  dryrun: {
    type: GraphQLBoolean,
    description:
      'No modification will be applied to the database, but the response will be the same as if it did.',
    defaultValue: false,
  },
}
