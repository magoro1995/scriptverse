'use strict'

// Gives repository-owned ScriptVerse levels a minimal victory presentation
// without changing the inherited CodeCombat modal for ordinary levels.
// This is an integration-stage cleanup: ScriptVerse will eventually own its
// complete victory screen and progression flow.

const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../app/templates/play/level/modal/hero-victory-modal.pug')
let source = fs.readFileSync(file, 'utf8')

const headerOld = `    #victory-title\n      if view.level.get('product', true) === 'codecombat-junior'`
const headerNew = `    #victory-title\n      if view.level.get('scriptverse')\n        h1 SCRIPTVERSE VICTORY\n        .scriptverse-level-complete= view.level.get('name')\n      else if view.level.get('product', true) === 'codecombat-junior'`

if (!source.includes('h1 SCRIPTVERSE VICTORY')) {
  if (!source.includes(headerOld)) throw new Error('Could not find victory header block.')
  source = source.replace(headerOld, headerNew)
}

const totalsOld = `  #totals(class=(view.showShareGameWithTeacher ? "hide" : "") + (view.level.get("product", true) == "codecombat-junior" ? " codecombat-junior" : ""))`
const totalsNew = `  #totals(class=(view.showShareGameWithTeacher ? "hide" : "") + (view.level.get("product", true) == "codecombat-junior" ? " codecombat-junior" : "") + (view.level.get('scriptverse') ? " hide" : ""))`
if (source.includes(totalsOld)) source = source.replace(totalsOld, totalsNew)

const signupOld = `  if me.get('anonymous') && !features.noAuth && !showHourOfCodeDoneButton\n    .sign-up-poke.hide`
const signupNew = `  if view.level.get('scriptverse')\n    .scriptverse-complete-message Mission complete. Continue your journey through Scripture and code.\n  else if me.get('anonymous') && !features.noAuth && !showHourOfCodeDoneButton\n    .sign-up-poke.hide`
if (!source.includes('Mission complete. Continue your journey through Scripture and code.')) {
  if (!source.includes(signupOld)) throw new Error('Could not find signup block.')
  source = source.replace(signupOld, signupNew)
}

fs.writeFileSync(file, source)
console.log('ScriptVerse victory UI wiring applied.')
console.log('Review with: git diff -- app/templates/play/level/modal/hero-victory-modal.pug')
