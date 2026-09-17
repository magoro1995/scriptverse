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
const DEFAULT_WORLD_TIME_LIMIT_SECONDS = 12
const DEFAULT_MAP_BOUNDS = { width: 42, height: 36 }

const ENGINE = {
  components: BASE_COMPONENTS,
  thangTypes: {
    captainHero: '529ec584c423d4e83b000014',
    goalTrigger: '52bcbf0dce43b70000000006',
    // Temporary visual skin only. World geometry comes from the ScriptVerse
    // manifest and must never be inferred from this inherited artwork.
    developmentBackground: '563d3c02f5b71e8405fabff8'
  },
  commonComponents: {
    says: '524b7b9f7fc0f6d519000015',
    plans: '524b7b517fc0f6d51900000d',
    equips: '53e217d253457600003e3ebb',
    scales: '52a399b98537a70000000003'
  },
  items: {
    simpleBoots: '53e237bf53457600003e3f05'
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
  if (manifest.map.bounds) {
    assert(manifest.map.bounds.width > 0 && manifest.map.bounds.height > 0, 'Map bounds must be positive.')
  }
  for (const scenery of manifest.map.scenery || []) {
    assert(scenery.id && scenery.kind, 'Every scenery entry requires id and kind.')
    assert(Number.isFinite(scenery.x) && Number.isFinite(scenery.y), `Scenery ${scenery.id} requires numeric x/y.`)
    assert(scenery.width > 0 && scenery.height > 0, `Scenery ${scenery.id} requires positive width/height.`)
  }
  return manifest
}

function component (original, config = {}) {
  return { original, majorVersion: 0, config }
}

function physicalAt (x, y, z = 0.5, dimensions = {}) {
  return component(ENGINE.components.physical, Object.assign({ pos: { x, y, z }, width: 1 }, dimensions))
}

function programmableFor (manifest) {
  const starterCode = manifest.mission.starterCode || ''
  return component(ENGINE.components.programmable, {
    programmableMethods: {
      plan: {
        name: 'plan',
        source: '// Guide Joshua through the camp.\nhero.moveRight();\n',
        languages: { python: starterCode },
        parameters: []
      }
    }
  })
}

function buildHeroPlaceholder (manifest) {
  const { x, y } = manifest.map.playerStart
  const worldEndsAfter = manifest.engine.worldEndsAfter || DEFAULT_WORLD_TIME_LIMIT_SECONDS
  return {
    id: manifest.engine.heroId || 'Hero Placeholder',
    thangType: ENGINE.thangTypes.captainHero,
    scriptverseRole: 'hero',
    components: [
      component(ENGINE.components.exists),
      physicalAt(x, y),
      programmableFor(manifest),
      component(ENGINE.commonComponents.says),
      component(ENGINE.commonComponents.plans, { worldEndsAfter }),
      component(ENGINE.commonComponents.equips, { inventory: { feet: ENGINE.items.simpleBoots } })
    ],
    scriptverseConfig: { position: { x, y }, availableMethods: manifest.learning.availableMethods || [] }
  }
}

function buildGoalMarker (manifest) {
  const { id, x, y } = manifest.map.goal
  return {
    id,
    thangType: ENGINE.thangTypes.goalTrigger,
    scriptverseRole: 'goal-trigger',
    components: [component(ENGINE.components.exists), physicalAt(x, y, 1)],
    scriptverseConfig: { position: { x, y } }
  }
}

function mapGeometryFor (manifest) {
  const bounds = Object.assign({}, DEFAULT_MAP_BOUNDS, manifest.map.bounds || {})
  return {
    width: bounds.width,
    height: bounds.height,
    centerX: bounds.width / 2 - 0.5,
    centerY: bounds.height / 2 + 0.5
  }
}

function buildDevelopmentBackground (manifest) {
  const geometry = mapGeometryFor(manifest)
  return {
    id: 'ScriptVerse World Background',
    thangType: ENGINE.thangTypes.developmentBackground,
    scriptverseRole: 'temporary-visual-skin',
    components: [
      component(ENGINE.components.exists),
      physicalAt(geometry.centerX, geometry.centerY, 1, {
        rotation: 0,
        width: geometry.width,
        height: geometry.height,
        depth: 2
      }),
      component(ENGINE.commonComponents.scales, { scaleFactor: 0.29, scaleFactorX: 0 })
    ],
    scriptverseConfig: {
      temporary: true,
      geometrySource: 'manifest.map.bounds',
      theme: manifest.map.theme,
      purpose: 'Temporary rendering skin. It does not define ScriptVerse gameplay coordinates or map layout.'
    }
  }
}

/**
 * Semantic scenery remains level data until each ScriptVerse scenery kind has a
 * compatible renderer. A full-map background ThangType cannot be safely reused
 * as a tent/path/water sprite: its own display geometry tiles the entire map.
 * Keeping scenery declarative here prevents inherited artwork from corrupting
 * the authored camp layout while preserving the data for the upcoming renderer.
 */
function buildScenery (manifest) {
  return (manifest.map.scenery || []).map(item => Object.assign({}, item))
}

function adaptLevelManifest (input) {
  const manifest = validateManifest(input)
  const profile = assertProfileResolved(HERO_MOVEMENT_PROFILE)
  const mapGeometry = mapGeometryFor(manifest)
  const scenery = buildScenery(manifest)

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
      mapGeometry,
      landmarks: manifest.map.landmarks || {},
      scenery,
      engineProfile: profile.id
    },
    goals: manifest.mission.goals,
    thangs: [buildDevelopmentBackground(manifest), buildHeroPlaceholder(manifest), buildGoalMarker(manifest)],
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
