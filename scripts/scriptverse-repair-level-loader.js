'use strict'

/**
 * One-time development repair helper.
 *
 * An earlier ScriptVerse contents-API edit accidentally truncated
 * app/lib/LevelLoader.coffee after the "# Session Loading" marker. This script
 * restores the missing tail from this fork's master branch while preserving
 * the ScriptVerse registry integration in the local working tree.
 *
 * Run from the repository root:
 *   node scripts/scriptverse-repair-level-loader.js
 *
 * The script changes only the local working tree. Review `git diff` before
 * committing/pushing.
 */

const fs = require('fs')
const https = require('https')
const path = require('path')

const filePath = path.join(process.cwd(), 'app/lib/LevelLoader.coffee')
const marker = '  # Session Loading\n'
const sourceURL = 'https://raw.githubusercontent.com/magoro1995/scriptverse/master/app/lib/LevelLoader.coffee'

function getText (url) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume()
        return getText(new URL(response.headers.location, url).toString()).then(resolve, reject)
      }
      let body = ''
      response.setEncoding('utf8')
      response.on('data', chunk => { body += chunk })
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(new Error(`${response.statusCode} ${response.statusMessage}: ${url}`))
        }
        resolve(body)
      })
    }).on('error', reject)
  })
}

async function main () {
  const local = fs.readFileSync(filePath, 'utf8')
  const master = await getText(sourceURL)
  const localMarker = local.indexOf(marker)
  const masterMarker = master.indexOf(marker)

  if (localMarker === -1 || masterMarker === -1) {
    throw new Error('Could not find Session Loading marker in both files.')
  }

  const localTail = local.slice(localMarker + marker.length).trim()
  if (localTail) {
    throw new Error('LevelLoader already has content after Session Loading; refusing to overwrite it.')
  }

  const repaired = local.slice(0, localMarker) + master.slice(masterMarker)
  fs.writeFileSync(filePath, repaired)
  console.log('[ScriptVerse] Restored LevelLoader tail from fork master.')
  console.log('[ScriptVerse] Preserved local ScriptVerse integration before Session Loading.')
  console.log('[ScriptVerse] Next: git diff -- app/lib/LevelLoader.coffee')
}

main().catch(error => {
  console.error(`[ScriptVerse] ${error.stack || error.message}`)
  process.exitCode = 1
})
