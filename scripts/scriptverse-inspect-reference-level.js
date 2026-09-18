'use strict'

/**
 * Development helper for discovering the executable LevelSystem references
 * used by a known-good upstream level without copying that level into
 * ScriptVerse.
 *
 * Usage:
 *   node scripts/scriptverse-inspect-reference-level.js dungeons-of-kithgard
 *
 * Optional:
 *   COCO_REFERENCE_ORIGIN=https://direct.staging.codecombat.com node ...
 *
 * The script prints only dependency metadata (system name/original/version and
 * component original/version pairs). It does not persist upstream level
 * narrative, scripts, goals, thangs, or other proprietary level content.
 */

const https = require('https')

const slug = process.argv[2] || 'dungeons-of-kithgard'
const origin = process.env.COCO_REFERENCE_ORIGIN || 'https://direct.staging.codecombat.com'
const url = `${origin}/db/level/${encodeURIComponent(slug)}`

function getJSON (target) {
  return new Promise((resolve, reject) => {
    https.get(target, { headers: { Accept: 'application/json' } }, response => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', chunk => { body += chunk })
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(new Error(`HTTP ${response.statusCode} while requesting ${target}`))
        }
        try {
          resolve(JSON.parse(body))
        } catch (error) {
          reject(new Error(`Could not parse reference level response as JSON: ${error.message}`))
        }
      })
    }).on('error', reject)
  })
}

function compactVersion (entry) {
  return {
    name: entry.name,
    original: entry.original,
    majorVersion: entry.majorVersion != null ? entry.majorVersion : entry.version && entry.version.major
  }
}

function uniqueByIdentity (entries) {
  const seen = new Set()
  return entries.filter(entry => {
    const key = `${entry.original}:${entry.majorVersion}`
    if (!entry.original || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function main () {
  const level = await getJSON(url)
  const systems = uniqueByIdentity((level.systems || []).map(compactVersion))
  const components = uniqueByIdentity((level.thangs || []).flatMap(thang => (thang.components || []).map(compactVersion)))

  console.log(JSON.stringify({
    referenceLevel: slug,
    systems,
    components
  }, null, 2))
}

main().catch(error => {
  console.error(`[ScriptVerse] ${error.message}`)
  process.exitCode = 1
})
