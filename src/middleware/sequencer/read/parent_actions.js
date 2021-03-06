// Create a structure indicating which actions are the parents of which action.
// This is needed since parent actions must be fired before children.
// Uses `commandpath` to determine this, and output a recursive structure
// { parentAction, childActions: [{...}, ...] }
export const getParentActions = function({ actions }) {
  return actions
    .filter(action => isParentAction({ action, actions }))
    .map(parentAction => getParentAction({ parentAction, actions }))
}

const getParentAction = function({ parentAction, actions }) {
  const childActions = getChildActions({ parentAction, actions })
  const childActionsA = getParentActions({ actions: childActions })
  return { parentAction, childActions: childActionsA }
}

const isParentAction = function({ action: childAction, actions }) {
  return !actions.some(parentAction =>
    isChildAction({ childAction, parentAction }),
  )
}

const getChildActions = function({ parentAction, actions }) {
  return actions.filter(childAction =>
    isChildAction({ childAction, parentAction }),
  )
}

const isChildAction = function({
  parentAction,
  parentAction: { commandpath: parentPath },
  childAction,
  childAction: { commandpath: childPath },
}) {
  return (
    childAction !== parentAction &&
    childPath.length > parentPath.length &&
    childPath.join('.').startsWith(parentPath.join('.'))
  )
}
