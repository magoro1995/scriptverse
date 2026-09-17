'use strict'

/**
 * Converts repository-owned ScriptVerse authoring manifests into the
 * ScriptVerse portion of the Level shape consumed by the inherited engine.
 *
 * This deliberately does not copy upstream CodeCombat level definitions.
 * During the engine-integration milestone we reuse a small number of generic
 * engine/common ThangTypes only as development stand-ins. ScriptVerse-owned
 * art can replace them without changing the manifest format.
 */

const { BASE_COMPONENTS, HERO_MOVEMENT_PROFILE, assertProfileResolved } = require('./engineProfile')

const SUPPORTED_FORMAT = 'scriptverse-level-v1'

const ENGINE = {
  components: BASE_COMPONENTS,
  thangTypes: {
    knightHero: '529ffbf1cf1818f2be000001',
    placeholderFlag: '53fa25f25bc220000052c2be'
  }
}

function assert (condition, message) {
  if (!condition) throw new Error(`[ScriptVerse] ${message}`)
}

function validateManifest (manifest) {
  assert(manifest && typeof manifest === 'object', 'Level manifest must be an object.')
  assert(manifest.format === SUPPORTED_FORMAT, `Unsupported level manifest format: ${manifest.format}`)
  assert(manifest.slug, 'Level manifest requires a slug.')
  assert(manifest.name, 'Level manifest requires a name.')
  assert(manifest.world, 'Level manifest requires a world.')
  assert(manifest.mission && Array.isArray(manifest.mission.goals) && manifest.mission.goals.length, 'Level manifest requires at least one goal.')
  assert(manifest.map && manifest.map.playerStart, 'Level manifest requires a player start position.')
  assert(manifest.map && manifest.map.goal && manifest.map.goal.id, 'Level manifest requires a goal marker.')
  return manifest
}

function component (original, config = {}) {
  return { original, majorVersion: 0, config }
}

function physicalAt (x, y) {
  return component(ENGINE.components.physical, { pos: { x, y, z: 0 } })
}

// Tome treats programmableMethods as spells. Hero levels expose one writable
// spell named `plan`; APIs such as moveRight are properties used inside it.
function programmableFor (manifest) {
  const starterCode = manifest.mission.starterCode || ''
  return component(ENGINE.components.programmable, {
    programmableMethods: {
      plan: {
        name: 'plan',
        source: '// Write your ScriptVerse solution here.\n',
        languages: { python: starterCode },
        parameters: [],
        permissions: {
          read: ['humans'],
          readwrite: ['humans']
        }
      }
    }
  })
}

function buildHeroPlaceholder (manifest) {
  const { x, y } = manifest.map.playerStart
  return {
    id: manifest.engine.heroId || 'Hero Placeholder',
    thangType: ENGINE.thangTypes.knightHero,
    scriptverseRole: 'hero',
    components: [
      component(ENGINE.components.exists),
      physicalAt(x, y),
      component(ENGINE.components.moves),
      programmableFor(manifest)
    ],
    scriptverseConfig: {
      position: { x, y },
      availableMethods: manifest.learning.availableMethods || []
    }
  }
}

function buildGoalMarker (manifest) {
  const { id, x, y } = manifest.map.goal
  return {
    id,
    thangType: ENGINE.thangTypes.placeholderFlag,
    scriptverseRole: 'goal-marker',
    components: [
      component(ENGINE.components.exists),
      physicalAt(x, y)
    ],
    scriptverseConfig: { position: { x, y } }
  }
}

function adaptLevelManifest (input) {
  const manifest = validateManifest(input)
  const profile = assertProfileResolved(HERO_MOVEMENT_PROFILE)

  return {
    name: manifest.name,
    slug: manifest.slug,
    type: manifest.engine.levelType || 'hero',
    version: { major: 0, minor: 1, isLatestMajor: true, isLatestMinor: true },
    scriptverse: {
      format: manifest.format,
      world: manifest.world,
      sequence: manifest.sequence,
      scripture: manifest.scripture,
      learning: manifest.learning,
      missionBriefing: manifest.mission.briefing,
      mapTheme: manifest.map.theme,
      engineProfile: profile.id
    },
    goals: manifest.mission.goals,
    thangs: [buildHeroPlaceholder(manifest), buildGoalMarker(manifest)],
    systems: profile.systems.map(({ original, majorVersion }) => ({ original, majorVersion })),
    scripts: [],
    documentation: { specificArticles: [] },
    requiredCapabilities: manifest.engine.requiredCapabilities || [],
    starterCode: manifest.mission.starterCode,
    defaultLanguage: manifest.learning.language || 'python'
  }
}

module.exports = {
  ENGINE,
  SUPPORTED_FORMAT,
  validateManifest,
  adaptLevelManifest
}
