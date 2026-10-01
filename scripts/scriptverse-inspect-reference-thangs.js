'use strict'

/**
 * Inspect only technical Thang/component configuration from a known-good
 * reference level. This is a diagnostic for ScriptVerse engine integration;
 * it intentionally omits narrative, scripts, goals, dialogue and level text.
 *
 * Usage:
 *   node scripts/scriptverse-inspect-reference-thangs.js dungeons-of-kithgard
 */

const https = require('https')

const origin = process.env.COCO_REFERENCE_ORIGIN || 'https://direct.staging.codecombat.com'
const slug = process.argv[2] || 'dungeons-of-kithgard'

function getJSON (url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Accept: 'application/json' } }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume()
        return getJSON(new URL(response.headers.location, url).toString()).then(resolve, reject)
      }
      let body = ''
      response.setEncoding('utf8')
      response.on('data', chunk => { body += chunk })
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) return reject(new Error(`${response.statusCode} ${response.statusMessage}: ${url}`))
        try { resolve(JSON.parse(body)) } catch (error) { reject(error) }
      })
    }).on('error', reject)
  })
}

async function main () {
  const level = await getJSON(`${origin}/db/level/${encodeURIComponent(slug)}`)
  const output = (level.thangs || []).map(thang => ({
    id: thang.id,
    thangType: thang.thangType,
    components: (thang.components || []).map(c => ({
      original: c.original,
      majorVersion: Number.isInteger(c.majorVersion) ? c.majorVersion : 0,
      config: c.config || {}
    }))
  }))
  process.stdout.write(`${JSON.stringify({ referenceLevel: slug, thangs: output }, null, 2)}\n`)
}

main().catch(error => {
  console.error(`[ScriptVerse] ${error.stack || error.message}`)
  process.exitCode = 1
})
