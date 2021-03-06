import logProcessErrors from 'log-process-errors'

import { logEvent } from '../log/main.js'
import { createPb } from '../errors/props.js'

// Error handling for all failures that are process-related
// If a single process might start two instances of the server, each instance
// will collect the warnings of all the instances.
// Note that process events fired that do not belong to autoserver might be
// caught as well.
export const processErrorHandler = function({ config }) {
  const stopProcessErrors = logProcessErrors({
    ...LOG_PROCESS_ERRORS_OPTS,
    log: emitProcessEvent.bind(null, { config }),
  })
  return { stopProcessErrors }
}

const LOG_PROCESS_ERRORS_OPTS = {
  exitOn: [],
  // See https://github.com/nodejs/node/issues/24321
  // We could log it as a `message` instead but it would lack the stack trace,
  // making it less useful.
  level: { multipleResolves: 'silent' },
}

// Report process problems as events with event 'failure'
const emitProcessEvent = async function({ config }, { stack }, level) {
  const error = createPb(stack, { reason: 'ENGINE' })

  await logEvent({
    event: 'failure',
    phase: 'process',
    level,
    params: { error },
    config,
  })
}
