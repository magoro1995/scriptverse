'use strict'

/**
 * Resolve the human-readable names of the DB-backed LevelSystem and
 * LevelComponent models used by a known-good reference level.
 *
 * This development helper intentionally prints only technical dependency
 * metadata. It does not persist or copy level narrative, scripts, goals,
 * thangs, or other proprietary level content.
 *
 * Usage:
 *   node scripts/scriptverse-inspect-engine-models.js dungeons-of-kithgard
 *
 * Optional:
 *   COCO_REFERENCE_ORIGIN=https://direct.staging.codecombat.com
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
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(new Error(`${response.statusCode} ${response.statusMessage}: ${url}`))
        }
        try {
          resolve(JSON.parse(body))
        } catch (error) {
          reject(new Error(`Could not parse JSON from ${url}: ${error.message}`))
        }
      })
    }).on('error', reject)
  })
}

function uniqueRefs (items) {
  const refs = new Map()
  for (const item of items || []) {
    if (!item || !item.original) continue
    const majorVersion = Number.isInteger(item.majorVersion) ? item.majorVersion : 0
    refs.set(`${item.original}:${majorVersion}`, { original: item.original, majorVersion })
  }
  return [...refs.values()]
}

async function resolveModel (kind, ref) {
  const path = kind === 'system' ? 'level.system' : 'level.component'
  const candidates = [
    `${origin}/db/${path}/${ref.original}/version/${ref.majorVersion}`,
    `${origin}/db/${path}/${ref.original}`
  ]

  let lastError
  for (const url of candidates) {
    try {
      const model = await getJSON(url)
      return {
        name: model.name || null,
        original: model.original || ref.original,
        majorVersion: model.version && Number.isInteger(model.version.major)
          ? model.version.major
          : ref.majorVersion
      }
    } catch (error) {
      lastError = error
    }
  }

  return {
    name: null,
    original: ref.original,
    majorVersion: ref.majorVersion,
    error: lastError ? lastError.message : 'unknown error'
  }
}

async function resolveAll (kind, refs) {
  const output = []
  // Keep requests sequential so this diagnostic is gentle on the reference API.
  for (const ref of refs) output.push(await resolveModel(kind, ref))
  return output
}

async function main () {
  const level = await getJSON(`${origin}/db/level/${encodeURIComponent(slug)}`)
  const systems = uniqueRefs(level.systems)
  const componentRefs = []
  for (const thang of level.thangs || []) {
    for (const component of thang.components || []) componentRefs.push(component)
  }
  const components = uniqueRefs(componentRefs)

  const result = {
    referenceLevel: slug,
    systems: await resolveAll('system', systems),
    components: await resolveAll('component', components)
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

main().catch(error => {
  console.error(`[ScriptVerse] ${error.stack || error.message}`)
  process.exitCode = 1
})
