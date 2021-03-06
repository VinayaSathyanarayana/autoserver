import { GraphQLString } from 'graphql'

// `cascade` argument
export const getCascadeArgument = function({ command }) {
  const hasCascade = CASCADE_COMMANDS.includes(command)

  if (!hasCascade) {
    return {}
  }

  return CASCADE_ARGS
}

const CASCADE_COMMANDS = ['delete']

const CASCADE_ARGS = {
  cascade: {
    type: GraphQLString,
    description: `Also delete specified nested collections.
Each attribute can use dot-delimited notation to specify deeply nested collections.
Several attributes can specified, by using a comma-separated list.`,
  },
}
