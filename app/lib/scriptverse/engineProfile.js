'use strict'

/**
 * Central description of the inherited engine services ScriptVerse levels need.
 *
 * Important distinction:
 * - Component IDs are known and stable in the source tree.
 * - LevelSystem executable models are DB-backed. Their original/version pairs
 *   must be verified before we put them here; guessing them would create a
 *   level that looks valid but cannot be simulated by World.loadFromLevel().
 */

const LevelComponent = require('models/LevelComponent')

const BASE_COMPONENTS = Object.freeze({
  physical: LevelComponent.PhysicalID,
  programmable: LevelComponent.ProgrammableID,
  moves: LevelComponent.MovesID,
  exists: LevelComponent.ExistsID,
  collides: LevelComponent.CollidesID
})

const HERO_MOVEMENT_PROFILE = Object.freeze({
  id: 'hero-movement-v1',
  components: [
    BASE_COMPONENTS.physical,
    BASE_COMPONENTS.programmable,
    BASE_COMPONENTS.moves,
    BASE_COMPONENTS.exists
  ],
  systems: [],
  unresolvedSystems: [
    'Existence',
    'Movement',
    'Action',
    'Collision'
  ]
})

function getProfile (id) {
  if (id === HERO_MOVEMENT_PROFILE.id) return HERO_MOVEMENT_PROFILE
  throw new Error(`[ScriptVerse] Unknown engine profile: ${id}`)
}

function assertProfileResolved (profile) {
  if (profile.unresolvedSystems && profile.unresolvedSystems.length) {
    throw new Error(`[ScriptVerse] Engine profile ${profile.id} still needs verified LevelSystem models: ${profile.unresolvedSystems.join(', ')}`)
  }
  return profile
}

module.exports = {
  BASE_COMPONENTS,
  HERO_MOVEMENT_PROFILE,
  getProfile,
  assertProfileResolved
}
