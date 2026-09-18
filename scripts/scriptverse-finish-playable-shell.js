'use strict'

const fs = require('fs')
const path = require('path')

const target = path.join(__dirname, '..', 'app', 'views', 'play', 'level', 'PlayLevelView.coffee')
let source = fs.readFileSync(target, 'utf8')

// This helper deliberately does NOT remove LevelLoadingView or force its start
// lifecycle. Doing so tears down the Tome/control-bar initialization. For now
// ScriptVerse keeps the inherited loading overlay while the rest of the playable
// shell remains intact; loading presentation will be fixed separately.
const directRemoval = [
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
const safeEarly = "    @initSurface() if @level.get('scriptverse') and not @surface\n"

if (source.includes(directRemoval.trim())) {
  source = source.replace(directRemoval, safeEarly)
} else if (!source.includes(safeEarly.trim())) {
  throw new Error('Expected ScriptVerse early Surface block not found; refusing to modify PlayLevelView.coffee')
}

const directStarted = [
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
const safeStarted = "  onLevelStarted: ->\n    return unless @surface? or @webSurface?\n    @loadingView?.showReady()\n    @trackLevelLoadEnd() unless @loadEndTime?\n"

if (source.includes(directStarted.trim())) {
  source = source.replace(directStarted, safeStarted)
} else if (!source.includes(safeStarted.trim())) {
  throw new Error('Expected onLevelStarted block not found; refusing to modify PlayLevelView.coffee')
}

fs.writeFileSync(target, source)
console.log('[ScriptVerse] Restored safe playable shell lifecycle; loading overlay left intact for separate UI work')
