import { PROTOCOLS } from '../../protocols/info.js'
import { RPCS } from '../../rpc/info.js'
import { COMMAND_TYPES } from '../../commands/constants.js'

// System parameters that are always present
// We need to specify their `type` and `isArray` for `coll.authorize`
// validation
export const SYSTEM_PARAMS = {
  requestid: { type: 'string' },
  timestamp: { type: 'string' },
  protocol: { type: 'string', validation: { enum: PROTOCOLS } },
  ip: { type: 'string' },
  origin: { type: 'string' },
  path: { type: 'string' },
  method: { type: 'string' },
  queryvars: { type: 'dynamic' },
  headers: { type: 'dynamic' },
  format: { type: 'string' },
  charset: { type: 'string' },
  compress: { type: 'string' },
  payload: { type: 'dynamic' },
  payloadsize: { type: 'integer' },
  payloadcount: { type: 'integer' },
  rpc: { type: 'string', validation: { enum: RPCS } },
  args: { type: 'dynamic' },
  datasize: { type: 'integer' },
  datacount: { type: 'integer' },
  params: { type: 'dynamic' },
  summary: { type: 'string' },
  commandpaths: { type: 'string', isArray: true },
  commandpath: { type: 'string' },
  collections: { type: 'string', isArray: true },
  collection: { type: 'string' },
  command: {
    type: 'string',
    validation: {
      enum: COMMAND_TYPES,
      // With patch authorization, one can simulate find and replace
      // authorization and vice-versa. So to avoid mistakes, we force
      // specifying them together.
      requires: [
        [['patch'], ['find']],
        [['upsert'], ['find']],
        [['create'], ['find']],
        [['delete'], ['find']],
        [['upsert'], ['create', 'patch']],
        [['create', 'patch'], ['upsert']],
      ],
    },
  },
  serverinfo: { type: 'dynamic' },
}

// Those system parameters are set after the database response
export const LATER_SYSTEM_PARAMS = [
  'status',
  'responsedata',
  'responsedatasize',
  'responsedatacount',
  'responsetype',
  'metadata',
  'modelscount',
  'uniquecount',
]

export const POSITIONAL_PARAMS = [
  'arg1',
  'arg2',
  'arg3',
  'arg4',
  'arg5',
  'arg6',
  'arg7',
  'arg8',
  'arg9',
]

// System parameters that are not always present
export const TEMP_SYSTEM_PARAMS = [
  // Generic model values
  'model',
  'value',
  'previousmodel',
  'previousvalue',

  // Custom validation and patch operators
  'arg',
  'type',

  // Logging parameters
  'log',
  'event',
  'phase',
  'level',
  'message',
  'error',
  'protocols',
  'exit',
  'measures',
  'measuresmessage',
  'duration',
]
