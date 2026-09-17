'use strict'

const fs = require('fs')
const path = require('path')

const target = path.join(__dirname, '..', 'app', 'views', 'play', 'level', 'PlayLevelView.coffee')
let source = fs.readFileSync(target, 'utf8')

const oldBlock = "    @initSurface() if @level.get('scriptverse') and not @surface\n"
const newBlock = [
  "    if @level.get('scriptverse')",
  "      @initSurface() unless @surface",
  "      # Repository levels do not wait for late proxy-only SuperModel resources.",
  "      # Once the playable Surface exists, dismiss the inherited loading shell.",
  "      _.defer =>",
  "        return if @destroyed",
  "        @loadingView?.showReady()",
  "        @loadingView?.startUnveiling()",
  "        @loadingView?.onClickStartLevel()",
  ''
].join('\n')

if (source.includes(newBlock.trim())) {
  console.log('[ScriptVerse] Playable shell cleanup already wired')
  process.exit(0)
}

if (!source.includes(oldBlock)) {
  throw new Error('ScriptVerse early Surface anchor not found in PlayLevelView.coffee')
}

source = source.replace(oldBlock, newBlock)
fs.writeFileSync(target, source)
console.log('[ScriptVerse] ScriptVerse levels now dismiss the inherited loading shell after Surface initialization')
