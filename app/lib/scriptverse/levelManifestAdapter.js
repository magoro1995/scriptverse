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

const SUPPORTED_FORMAT = 'scriptverse-level-v1'

// Existing engine identities. These are reusable infrastructure references,
// not copied level content.
const ENGINE = {
  components: {
    physical: '524b75ad7fc0f6d519000001',
    programmable: '524b7b5a7fc0f6d51900000e',
    moves: '524b7b8c7fc0f6d519000013'
  },
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

function physicalAt (x, y) {
  return {
    original: ENGINE.components.physical,
    majorVersion: 0,
    config: {
      pos: { x, y, z: 0 }
    }
  }
}

function programmableFor (methods) {
  return {
    original: ENGINE.components.programmable,
    majorVersion: 0,
    config: {
      programmableMethods: methods || []
    }
  }
}

function buildHeroPlaceholder (manifest) {
  const { x, y } = manifest.map.playerStart
  return {
    id: manifest.engine.heroId || 'Hero Placeholder',
    // Provisional visual/runtime stand-in. Level.denormalizeThang already knows
    // how to replace Hero Placeholder with the session hero where appropriate.
    thangType: ENGINE.thangTypes.knightHero,
    scriptverseRole: 'hero',
    components: [
      physicalAt(x, y),
      programmableFor(manifest.learning.availableMethods)
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
    // Reuse the engine's generic placeholder marker only for the integration
    // milestone. This will become a ScriptVerse-owned officer/waypoint asset.
    thangType: ENGINE.thangTypes.placeholderFlag,
    scriptverseRole: 'goal-marker',
    components: [physicalAt(x, y)],
    scriptverseConfig: {
      position: { x, y }
    }
  }
}

function adaptLevelManifest (input) {
  const manifest = validateManifest(input)

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
      mapTheme: manifest.map.theme
    },
    goals: manifest.mission.goals,
    thangs: [
      buildHeroPlaceholder(manifest),
      buildGoalMarker(manifest)
    ],
    // Systems are DB-backed executable models. They are intentionally not
    // guessed here. The loader resolves them from a ScriptVerse engine profile
    // once their stable original/version pairs have been verified.
    systems: [],
    scripts: [],
    documentation: {
      specificArticles: []
    },
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
