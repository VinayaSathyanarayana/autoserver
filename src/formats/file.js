import { pReadFile, pWriteFile } from '../utils/fs.js'

import { parseContent, serializeContent } from './content.js'

// Loads any of the supported formats
// This is abstracted to allow easily adding new formats.
// This might throw for many different reasons, e.g. wrong syntax,
// or cannot access file (does not exist or no permissions)
export const parseFile = async function(format, path, { compat }) {
  const content = await pReadFile(path, { encoding: 'utf-8' })

  const contentA = parseContent(format, content, { path, compat })
  return contentA
}

// Persist file, using any of the supported formats
export const serializeFile = async function(format, path, content) {
  const contentA = serializeContent(format, content)

  const contentB = await pWriteFile(path, contentA, { encoding: 'utf-8' })
  return contentB
}
