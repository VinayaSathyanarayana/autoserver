import { render } from 'mustache'

import { pReadFile } from './fs.js'

export const renderTemplate = async function({ template, data }) {
  const htmlFile = await pReadFile(template, { encoding: 'utf-8' })
  const htmlString = render(htmlFile, data)
  return htmlString
}
