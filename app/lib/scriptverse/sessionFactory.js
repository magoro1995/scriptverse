'use strict'

const LevelSession = require('models/LevelSession')

function buildStarterCode (level) {
  const source = level.get('starterCode') || ''
  return {
    'hero-placeholder': {
      plan: source
    }
  }
}

function createLocalSession (level, creatorID) {
  const codeLanguage = level.get('defaultLanguage') || 'python'
  const session = new LevelSession({
    _id: LevelSession.fakeID,
    creator: creatorID,
    level: {
      original: level.get('original'),
      majorVersion: level.get('version').major
    },
    state: {
      complete: false,
      scripts: {}
    },
    permissions: [
      { target: creatorID, access: 'owner' },
      { target: 'public', access: 'write' }
    ],
    codeLanguage,
    code: buildStarterCode(level)
  })

  session.loaded = true
  session.fake = true
  for (const method of ['save', 'patch', 'put']) {
    session[method] = () => console.debug(`[ScriptVerse] Ignoring ${method} for local development session.`)
  }
  return session
}

module.exports = {
  buildStarterCode,
  createLocalSession
}
