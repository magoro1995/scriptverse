'use strict'

/**
 * Central description of the inherited engine services ScriptVerse levels need.
 *
 * Component IDs come from the inherited client source tree. LevelSystem models
 * are DB-backed, so their original/version pairs must be observed from a
 * known-good reference level rather than guessed.
 *
 * The dependency metadata below was inspected from the upstream
 * `dungeons-of-kithgard` level on 2026-09-17 using ScriptVerse's metadata-only
 * inspectors. We intentionally retain only technical dependency metadata, not
 * upstream level narrative/content.
 */

const LevelComponent = require('models/LevelComponent')

const BASE_COMPONENTS = Object.freeze({
  physical: LevelComponent.PhysicalID,
  programmable: LevelComponent.ProgrammableID,
  moves: LevelComponent.MovesID,
  exists: LevelComponent.ExistsID,
  collides: LevelComponent.CollidesID
})

const DUNGEONS_OF_KITHGARD_SYSTEMS = Object.freeze([
  { name: 'AI', original: '528110f30268d018e3000001', majorVersion: 0 },
  { name: 'Action', original: '52810ffa33e01a6e86000012', majorVersion: 0 },
  { name: 'Alliance', original: '528111b30268d018e3000004', majorVersion: 0 },
  { name: 'Collision', original: '528105f833e01a6e86000007', majorVersion: 0 },
  { name: 'Combat', original: '528112530268d018e3000007', majorVersion: 0 },
  { name: 'Display', original: '52ae4f02a4dcd4415200000b', majorVersion: 0 },
  { name: 'Effect', original: '52e953e81b2028d102000004', majorVersion: 0 },
  { name: 'Event', original: '528112c00268d018e3000008', majorVersion: 0 },
  { name: 'Existence', original: '5280f83b8ae1581b66000001', majorVersion: 0 },
  { name: 'Hearing', original: '52810f4933e01a6e8600000c', majorVersion: 0 },
  { name: 'Inventory', original: '5280dc4d251616c907000001', majorVersion: 0 },
  { name: 'Magic', original: '52f1354370fb890000000005', majorVersion: 0 },
  { name: 'Movement', original: '528113240268d018e300000c', majorVersion: 0 },
  { name: 'Physics', original: '528114040268d018e3000011', majorVersion: 0 },
  { name: 'Programming', original: '5281146f0268d018e3000014', majorVersion: 0 },
  { name: 'Targeting', original: '528114b20268d018e3000017', majorVersion: 0 },
  { name: 'UI', original: '528114e60268d018e300001a', majorVersion: 0 },
  { name: 'Vision', original: '528115040268d018e300001b', majorVersion: 0 }
])

const REFERENCE_COMPONENTS = Object.freeze([
  { name: 'Exists', original: '524b4150ff92f1f4f8000024', majorVersion: 0 },
  { name: 'Physical', original: '524b75ad7fc0f6d519000001', majorVersion: 0 },
  { name: 'Scales', original: '52a399b98537a70000000003', majorVersion: 0 },
  { name: 'Programmable', original: '524b7b5a7fc0f6d51900000e', majorVersion: 0 },
  { name: 'Says', original: '524b7b9f7fc0f6d519000015', majorVersion: 0 },
  { name: 'Plans', original: '524b7b517fc0f6d51900000d', majorVersion: 0 },
  { name: 'Equips', original: '53e217d253457600003e3ebb', majorVersion: 0 }
])

function systemsNamed (...names) {
  const requested = new Set(names)
  const systems = DUNGEONS_OF_KITHGARD_SYSTEMS.filter(system => requested.has(system.name))
  const missing = names.filter(name => !systems.some(system => system.name === name))
  if (missing.length) throw new Error(`[ScriptVerse] Unknown verified LevelSystem(s): ${missing.join(', ')}`)
  return systems
}

// Conservative first-playable profile. Joshua 1 needs code execution, actions,
// movement/physics, existence, events, rendering and UI. Combat, Magic, Hearing,
// Inventory, Targeting and Vision are intentionally excluded until a later
// mission requires them. We keep Collision and Alliance for normal world/team
// semantics while we validate the first playable level.
const HERO_MOVEMENT_PROFILE = Object.freeze({
  id: 'hero-movement-v1',
  components: [
    BASE_COMPONENTS.physical,
    BASE_COMPONENTS.programmable,
    BASE_COMPONENTS.moves,
    BASE_COMPONENTS.exists
  ],
  systems: Object.freeze(systemsNamed(
    'Action',
    'Alliance',
    'Collision',
    'Display',
    'Event',
    'Existence',
    'Movement',
    'Physics',
    'Programming',
    'UI'
  )),
  unresolvedSystems: []
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
  DUNGEONS_OF_KITHGARD_SYSTEMS,
  REFERENCE_COMPONENTS,
  HERO_MOVEMENT_PROFILE,
  systemsNamed,
  getProfile,
  assertProfileResolved
}
