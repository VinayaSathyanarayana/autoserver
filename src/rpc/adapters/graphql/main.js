import { parse } from './parse/main.js'
import { transformSuccess, transformError } from './response.js'
import { load } from './load/main.js'

export const graphql = {
  name: 'graphql',
  title: 'GraphQL',
  routes: ['/graphql'],
  methods: ['GET', 'POST'],
  parse,
  transformSuccess,
  transformError,
  load,
}
