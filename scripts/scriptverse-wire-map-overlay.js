'use strict'

const fs = require('fs')
const path = require('path')

const target = path.join(__dirname, '..', 'app', 'lib', 'surface', 'Surface.coffee')
let source = fs.readFileSync(target, 'utf8')

const requireAnchor = "CoordinateGrid = require './CoordinateGrid'\n"
const requireLine = "ScriptVerseMapOverlay = require './ScriptVerseMapOverlay'\n"
if (!source.includes(requireLine)) {
  if (!source.includes(requireAnchor)) throw new Error('Surface require anchor not found')
  source = source.replace(requireAnchor, requireAnchor + requireLine)
}

// Older revisions mounted terrain on gridLayer. That regular-canvas layer is
// composited above the WebGL sprite stage, so it hid Joshua and the goal. The
// Land layer is the engine's intended bottom gameplay layer (priority -40).
source = source.replace(
  "@scriptverseMapOverlay = new ScriptVerseMapOverlay camera: @camera, layer: @gridLayer, map: {geometry: sv.mapGeometry, scenery: sv.scenery}",
  "@scriptverseMapOverlay = new ScriptVerseMapOverlay camera: @camera, layer: @lankBoss.layerAdapters['Land'], map: {geometry: sv.mapGeometry, scenery: sv.scenery}"
)

const initAnchor = "    @coordinateGrid ?= new CoordinateGrid gridOptions, @world.size()\n"
const initLines = [
  "    if @options.level?.get('scriptverse')? and not @scriptverseMapOverlay?",
  "      sv = @options.level.get 'scriptverse'",
  "      @scriptverseMapOverlay = new ScriptVerseMapOverlay camera: @camera, layer: @lankBoss.layerAdapters['Land'], map: {geometry: sv.mapGeometry, scenery: sv.scenery}",
  ''
].join('\n')
if (!source.includes('new ScriptVerseMapOverlay')) {
  if (!source.includes(initAnchor)) throw new Error('Surface coordinate initialization anchor not found')
  source = source.replace(initAnchor, initAnchor + initLines)
}

fs.writeFileSync(target, source)
console.log('[ScriptVerse] Wired manifest-driven terrain below gameplay sprites in the Land layer')
