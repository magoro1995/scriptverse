'use strict'

/**
 * Inspect only generic physics/collision component configuration from a known
 * good reference level. This is dependency metadata, not authored level content.
 *
 * Usage:
 *   node scripts/scriptverse-inspect-collision-components.js dungeons-of-kithgard
 */

const https = require('https')

const origin = process.env.COCO_REFERENCE_ORIGIN || 'https://direct.staging.codecombat.com'
const slug = process.argv[2] || 'dungeons-of-kithgard'
const COLLIDES = '524b7b857fc0f6d519000012'
const PHYSICAL = '524b75ad7fc0f6d519000001'

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
  const rows = []
  for (const thang of level.thangs || []) {
    const collides = (thang.components || []).find(c => c.original === COLLIDES)
    if (!collides) continue
    const physical = (thang.components || []).find(c => c.original === PHYSICAL)
    rows.push({
      id: thang.id,
      thangType: thang.thangType,
      physical: physical ? physical.config || {} : null,
      collides: collides.config || {}
    })
  }
  process.stdout.write(`${JSON.stringify({ referenceLevel: slug, collisionThangs: rows }, null, 2)}\n`)
}

main().catch(error => {
  console.error(`[ScriptVerse] ${error.stack || error.message}`)
  process.exitCode = 1
})
