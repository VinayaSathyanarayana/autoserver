import { getOperator } from '../operators/main.js'
import { mapNodes } from '../crawl.js'

// Try to simplify AST
export const optimizeFilter = function({ filter }) {
  return mapNodes(filter, optimizeNode)
}

const optimizeNode = function(node) {
  const { optimize } = getOperator({ node })

  if (optimize === undefined) {
    return node
  }

  const nodeA = optimize(node)
  return nodeA
}
