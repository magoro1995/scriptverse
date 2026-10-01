'use strict'

/**
 * Prints only engine/layout metadata needed to reproduce a playable ScriptVerse
 * world: non-hero Thang ids/types, positions, and component identities/config.
 * Narrative text, scripts, goals, dialogue, and authored code are omitted.
 *
 * Usage:
 *   node scripts/scriptverse-inspect-reference-world.js dungeons-of-kithgard
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

function positionOf (thang) {
  for (const c of thang.components || []) {
    const pos = c.config && c.config.pos
    if (pos) return { x: pos.x, y: pos.y, z: pos.z }
  }
  return null
}

async function main () {
  const level = await getJSON(`${origin}/db/level/${encodeURIComponent(slug)}`)
  const thangs = (level.thangs || [])
    .filter(t => !/Hero Placeholder/.test(t.id || ''))
    .map(t => ({
      id: t.id,
      thangType: t.thangType,
      pos: positionOf(t),
      components: (t.components || []).map(c => ({
        original: c.original,
        majorVersion: Number.isInteger(c.majorVersion) ? c.majorVersion : 0,
        config: c.config || {}
      }))
    }))

  process.stdout.write(`${JSON.stringify({
    referenceLevel: slug,
    levelType: level.type,
    nonHeroThangs: thangs
  }, null, 2)}\n`)
}

main().catch(error => {
  console.error(`[ScriptVerse] ${error.stack || error.message}`)
  process.exitCode = 1
})
