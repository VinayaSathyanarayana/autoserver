import { renderGraphiql } from './render.js'

// Render GraphiQL HTML file, i.e. GraphQL debugger
export const parse = async function({ queryvars, payload = {}, origin }) {
  const endpointURL = `${origin}/graphql`
  const { query, variables, operationName } = { ...queryvars, ...payload }

  const content = await renderGraphiql({
    endpointURL,
    query,
    variables,
    operationName,
  })

  return { response: { type: 'html', content } }
}
