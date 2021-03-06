export const opts = {
  type: 'object',
  additionalProperties: false,
  properties: {
    hostname: {
      type: 'string',
    },
    port: {
      type: 'integer',
      minimum: 0,
      maximum: 65535,
    },
  },
}
