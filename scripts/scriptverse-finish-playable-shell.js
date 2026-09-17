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
const previousFixed = [
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
const fixedEarly = [
  "    if @level.get('scriptverse')",
  "      @initSurface() unless @surface",
  "      # ScriptVerse repository levels initialize their playable Surface early.",
  "      # Remove only the inherited loading overlay; do not invoke its normal",
  "      # intro/start lifecycle because that path waits on unrelated resources.",
  "      _.defer =>",
  "        return if @destroyed or not @loadingView?",
  "        @loadingView.$el.remove()",
  "        @removeSubView @loadingView",
  "        @loadingView = null",
  "        @unveiling = false",
  "        @unveiled = true",
  "        @surface?.showLevel()",
  "        Backbone.Mediator.publish 'level:set-time', time: 0",
  "        $(window).trigger 'resize'",
  ''
].join('\n')

if (source.includes(previousFixed.trim())) {
  source = source.replace(previousFixed, fixedEarly)
} else if (source.includes(brokenEarly.trim())) {
  source = source.replace(brokenEarly, fixedEarly)
} else if (source.includes(originalEarly)) {
  source = source.replace(originalEarly, fixedEarly)
} else if (!source.includes(fixedEarly.trim())) {
  throw new Error('ScriptVerse early Surface anchor not found in PlayLevelView.coffee')
}

const oldStarted = "  onLevelStarted: ->\n    return unless @surface? or @webSurface?\n    @loadingView.showReady()\n    @trackLevelLoadEnd()\n"
const previousStarted = "  onLevelStarted: ->\n    return unless @surface? or @webSurface?\n    @loadingView?.showReady()\n    @trackLevelLoadEnd() unless @loadEndTime?\n"
const newStarted = [
  "  onLevelStarted: ->",
  "    return unless @surface? or @webSurface?",
  "    if @level.get('scriptverse') and not @loadingView?",
  "      @trackLevelLoadEnd() unless @loadEndTime?",
  "      @surface?.showLevel()",
  "      Backbone.Mediator.publish 'level:set-time', time: 0",
  "      return",
  "    @loadingView?.showReady()",
  "    @trackLevelLoadEnd() unless @loadEndTime?",
  ''
].join('\n')

if (source.includes(previousStarted)) {
  source = source.replace(previousStarted, newStarted)
} else if (source.includes(oldStarted)) {
  source = source.replace(oldStarted, newStarted)
} else if (!source.includes(newStarted.trim())) {
  throw new Error('onLevelStarted loading anchor not found in PlayLevelView.coffee')
}

fs.writeFileSync(target, source)
console.log('[ScriptVerse] Inherited loading overlay is removed directly after early Surface initialization')
