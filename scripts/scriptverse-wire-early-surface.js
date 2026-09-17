'use strict'

// ScriptVerse repository levels have all engine-critical models available when
// LevelLoader emits world-necessities-loaded, but the inherited CodeCombat
// loading screen normally waits for every late/nonessential SuperModel resource
// before constructing Surface. In proxy development that can leave a fully
// simulated ScriptVerse world hidden behind the loading preview.
//
// This one-time helper makes ScriptVerse construct Surface as soon as the world
// necessities are ready, while preserving the upstream path for normal levels.

const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../app/views/play/level/PlayLevelView.coffee')
let source = fs.readFileSync(file, 'utf8')

const marker = '    @initScriptManager()\n'
const insertion = [
  marker,
  "    # Repository-owned ScriptVerse levels already have everything needed to",
  "    # render at world-necessities-loaded. Do not keep their playable Surface",
  "    # hidden behind late proxy/nonessential SuperModel resources.",
  "    @initSurface() if @level.get('scriptverse') and not @surface",
  ''
].join('\n')

if (!source.includes("@initSurface() if @level.get('scriptverse') and not @surface")) {
  if (!source.includes(marker)) throw new Error('Could not find initScriptManager marker in PlayLevelView.coffee')
  source = source.replace(marker, insertion)
}

const oldLateInit = "    else\n      @initSurface()\n\n  saveRecentMatch: ->"
const newLateInit = "    else\n      @initSurface() unless @surface\n\n  saveRecentMatch: ->"
if (source.includes(oldLateInit)) {
  source = source.replace(oldLateInit, newLateInit)
} else if (!source.includes("@initSurface() unless @surface")) {
  throw new Error('Could not find late initSurface block in PlayLevelView.coffee')
}

fs.writeFileSync(file, source)
console.log('ScriptVerse early Surface wiring applied.')
console.log('Review with: git diff -- app/views/play/level/PlayLevelView.coffee')
