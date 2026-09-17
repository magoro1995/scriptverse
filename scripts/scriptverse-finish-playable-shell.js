'use strict'

const fs = require('fs')
const path = require('path')

const target = path.join(__dirname, '..', 'app', 'views', 'play', 'level', 'PlayLevelView.coffee')
let source = fs.readFileSync(target, 'utf8')

const originalEarly = "    @initSurface() if @level.get('scriptverse') and not @surface\n"
const brokenEarly = [
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
const fixedEarly = [
  "    if @level.get('scriptverse')",
  "      @initSurface() unless @surface",
  "      # Repository levels can become playable before the inherited loader",
  "      # reaches 100%. Unveil once Surface exists, but let the normal",
  "      # level-start lifecycle select the hero and initialize the camera.",
  "      _.defer =>",
  "        return if @destroyed or not @loadingView?",
  "        @loadingView.showReady()",
  "        @loadingView.unveil true",
  ''
].join('\n')

if (source.includes(brokenEarly.trim())) {
  source = source.replace(brokenEarly, fixedEarly)
} else if (source.includes(originalEarly)) {
  source = source.replace(originalEarly, fixedEarly)
} else if (!source.includes(fixedEarly.trim())) {
  throw new Error('ScriptVerse early Surface anchor not found in PlayLevelView.coffee')
}

const oldStarted = "  onLevelStarted: ->\n    return unless @surface? or @webSurface?\n    @loadingView.showReady()\n    @trackLevelLoadEnd()\n"
const newStarted = "  onLevelStarted: ->\n    return unless @surface? or @webSurface?\n    @loadingView?.showReady()\n    @trackLevelLoadEnd() unless @loadEndTime?\n"

if (source.includes(oldStarted)) {
  source = source.replace(oldStarted, newStarted)
} else if (!source.includes(newStarted)) {
  throw new Error('onLevelStarted loading anchor not found in PlayLevelView.coffee')
}

fs.writeFileSync(target, source)
console.log('[ScriptVerse] Loading shell lifecycle fixed: no duplicate start call and late level-start is null-safe')
