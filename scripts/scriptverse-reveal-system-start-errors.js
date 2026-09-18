'use strict'

/**
 * Development diagnostic for ScriptVerse engine integration.
 *
 * The CodeCombat worker forwards console arguments with postMessage. When a
 * LevelSystem start() throws, world.coffee currently logs the entire system
 * object. That object contains functions and cannot be structured-cloned, so
 * the browser reports a DataCloneError instead of the original system error.
 *
 * This helper changes only that diagnostic log in the local working tree so
 * the actual failing system name/message/stack can cross the worker boundary.
 * Review the diff before committing.
 */

const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../app/lib/world/world.coffee')
let source = fs.readFileSync(file, 'utf8')

const oldLog = '        console.error "Error starting system!", system, err\n'
const newLog = '        console.error "Error starting system #{system.className ? system.constructor?.className ? \'unknown\'}: #{err?.message ? err}", err?.stack ? \'\'\n'

if (source.includes(newLog)) {
  console.log('[ScriptVerse] Worker system-start diagnostic is already installed.')
  process.exit(0)
}

if (!source.includes(oldLog)) {
  throw new Error('Could not find the expected system-start error log in app/lib/world/world.coffee')
}

source = source.replace(oldLog, newLog)
fs.writeFileSync(file, source)

console.log('[ScriptVerse] Replaced non-cloneable system error logging with strings only.')
console.log('[ScriptVerse] Rebuild and reload Joshua 1 to reveal the underlying LevelSystem start error.')
