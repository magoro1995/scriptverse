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

const ENGINE = {
  components: BASE_COMPONENTS,
  thangTypes: {
    captainHero: '529ec584c423d4e83b000014',
    goalTrigger: '52bcbf0dce43b70000000006',
    // Temporary generic engine background used only to validate ScriptVerse's
    // map pipeline. Original Promised Land artwork will replace this stand-in.
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

function buildDevelopmentBackground () {
  return {
    id: 'ScriptVerse World Background',
    thangType: ENGINE.thangTypes.developmentBackground,
    scriptverseRole: 'world-background',
    components: [
      component(ENGINE.components.exists),
      physicalAt(20.5, 18.5, 1, { rotation: 0, width: 42, height: 36, depth: 2 }),
      component(ENGINE.commonComponents.scales, { scaleFactor: 0.29, scaleFactorX: 0 })
    ],
    scriptverseConfig: {
      temporary: true,
      purpose: 'Validate ScriptVerse map rendering before original Promised Land artwork is introduced.'
    }
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
    thangs: [buildDevelopmentBackground(), buildHeroPlaceholder(manifest), buildGoalMarker(manifest)],
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
