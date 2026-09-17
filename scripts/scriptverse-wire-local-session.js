'use strict'

// One-time source migration helper. It makes repository-owned ScriptVerse
// levels use a local fake LevelSession instead of requesting a session from
// the upstream CodeCombat backend.

const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../app/lib/LevelLoader.coffee')
let source = fs.readFileSync(file, 'utf8')

const requireNeedle = "scriptverseLevelRegistry = require 'lib/scriptverse/levelRegistry'\n"
const requireReplacement = requireNeedle + "scriptverseSessionFactory = require 'lib/scriptverse/sessionFactory'\n"

if (!source.includes("scriptverseSessionFactory = require 'lib/scriptverse/sessionFactory'")) {
  if (!source.includes(requireNeedle)) throw new Error('Could not find ScriptVerse registry require in LevelLoader.')
  source = source.replace(requireNeedle, requireReplacement)
}

const sessionNeedle = `    if @sessionless\n      null\n    else if @fakeSessionConfig?\n      @loadFakeSession()\n    else\n      @loadSession()\n`

const sessionReplacement = `    if @sessionless\n      null\n    else if scriptverseLevelRegistry.hasLevel @levelID\n      @loadScriptVerseSession()\n    else if @fakeSessionConfig?\n      @loadFakeSession()\n    else\n      @loadSession()\n`

if (!source.includes('@loadScriptVerseSession()')) {
  if (!source.includes(sessionNeedle)) throw new Error('Could not find LevelLoader session-selection block.')
  source = source.replace(sessionNeedle, sessionReplacement)
}

const methodMarker = '  # Session Loading\n\n'
const method = `  loadScriptVerseSession: ->\n    @session = scriptverseSessionFactory.createLocalSession @level, me.id\n    @supermodel.trackModel @session\n    @loadDependenciesForSession @session\n\n`

if (!source.includes('  loadScriptVerseSession: ->')) {
  if (!source.includes(methodMarker)) throw new Error('Could not find Session Loading marker.')
  source = source.replace(methodMarker, methodMarker + method)
}

fs.writeFileSync(file, source)
console.log('Wired ScriptVerse local sessions into app/lib/LevelLoader.coffee')
console.log('Review git diff, then commit the generated LevelLoader change.')
