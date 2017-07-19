'use strict';

const { EngineError } = require('../../error');

// Retrieve response's status
const getStatus = async function (input) {
  try {
    const response = await this.next(input);

    const { protocolStatus, status } = getStatuses({ input });
    Object.assign(response, { protocolStatus, status });

    return response;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    const { protocolStatus, status } = getStatuses({ input, error: errorObj });
    Object.assign(errorObj, { protocolStatus, status });

    throw errorObj;
  }
};

const getStatuses = function ({
  input: { log, protocolHandler, protocolStatus: currentProtocolStatus },
  error,
}) {
  // Protocol-specific status, e.g. HTTP status code
  const protocolStatus = currentProtocolStatus ||
    protocolHandler.getProtocolStatus({ error });

  if (protocolStatus === undefined) {
    const message = '\'protocolStatus\' must be defined';
    throw new EngineError(message, { reason: 'SERVER_INPUT_VALIDATION' });
  }

  // Protocol-agnostic status
  const status = protocolHandler.getStatus({ protocolStatus });

  if (status === undefined) {
    const message = '\'status\' must be defined';
    throw new EngineError(message, { reason: 'SERVER_INPUT_VALIDATION' });
  }

  // Used to indicate that `status` and `protocolStatus` should be kept
  // by the `error_status` middleware
  if (error !== undefined) {
    error.isStatusError = true;
  }

  log.add({ protocolStatus, status });
  return { protocolStatus, status };
};

module.exports = {
  getStatus,
};
