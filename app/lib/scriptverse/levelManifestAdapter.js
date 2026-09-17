'use strict'

/**
 * Converts repository-owned ScriptVerse authoring manifests into the
 * ScriptVerse portion of the Level shape consumed by the inherited engine.
 *
 * This deliberately does not copy upstream CodeCombat level definitions.
 * Engine dependencies (ThangTypes, LevelComponents and LevelSystems) are
 * resolved separately by the existing loader/integration layer.
 */

const SUPPORTED_FORMAT = 'scriptverse-level-v1'

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

function buildHeroPlaceholder (manifest) {
  const { x, y } = manifest.map.playerStart
  return {
    id: manifest.engine.heroId || 'Hero Placeholder',
    // The concrete ThangType is intentionally resolved by the integration
    // layer so ScriptVerse does not encode an upstream hero asset here.
    thangType: null,
    scriptverseRole: 'hero',
    components: [],
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
    thangType: null,
    scriptverseRole: 'goal-marker',
    components: [],
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
  SUPPORTED_FORMAT,
  validateManifest,
  adaptLevelManifest
}
