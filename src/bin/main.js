#!/usr/bin/env node
import { exit } from 'process'

import * as instructions from '../main.js'
import { addErrorHandler } from '../errors/handler.js'

import { parseInput } from './input.js'

// Run a server instruction, from the CLI
const startCli = async function() {
  const measures = []
  const { instruction, opts } = parseInput({ measures })

  await instructions[instruction]({ ...opts, measures })
}

// If an error is thrown, print error's description,
// then exit with exit code 1
const cliErrorHandler = function({ message, description = message }) {
  console.error(`Error: ${description}`)

  exit(1)
}

const eStartCli = addErrorHandler(startCli, cliErrorHandler)

eStartCli()
