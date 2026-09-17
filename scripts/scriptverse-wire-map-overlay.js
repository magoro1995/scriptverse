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

const initAnchor = "    @coordinateGrid ?= new CoordinateGrid gridOptions, @world.size()\n"
const initLines = [
  "    if @options.level?.get('scriptverse')? and not @scriptverseMapOverlay?",
  "      sv = @options.level.get 'scriptverse'",
  "      @scriptverseMapOverlay = new ScriptVerseMapOverlay camera: @camera, layer: @gridLayer, map: {geometry: sv.mapGeometry, scenery: sv.scenery}",
  ''
].join('\n')
if (!source.includes('new ScriptVerseMapOverlay')) {
  if (!source.includes(initAnchor)) throw new Error('Surface coordinate initialization anchor not found')
  source = source.replace(initAnchor, initAnchor + initLines)
}

fs.writeFileSync(target, source)
console.log('[ScriptVerse] Wired manifest-driven map overlay into Surface.coffee')
