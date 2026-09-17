CocoClass = require 'core/CocoClass'
createjs = require 'lib/createjs-parts'

# Development renderer for repository-owned ScriptVerse map geometry. It draws
# directly from semantic manifest data so visible geometry and physics share the
# same world coordinates. Original art can replace these primitives later.
module.exports = class ScriptVerseMapOverlay extends CocoClass
  constructor: (options = {}) ->
    super()
    @camera = options.camera
    @layer = options.layer
    @map = options.map
    return unless @camera? and @layer? and @map?
    @build()

  destroy: ->
    @layer?.removeChild @container if @container?
    super()

  build: ->
    @container = new createjs.Container()
    @container.mouseEnabled = false

    geometry = @map.geometry or {}
    if geometry.width? and geometry.height?
      @drawWorldRect 0, 0, geometry.width, geometry.height, '#c8ad78', 1

    for item in (@map.scenery or [])
      switch item.kind
        when 'water'
          @drawCenteredRect item, '#4f91ad', 0.9
        when 'path'
          @drawCenteredRect item, '#d5bd8b', 0.9
        when 'tent-cluster'
          @drawCenteredRect item, '#9a7049', 0.9
        when 'officers-area'
          @drawCenteredRect item, '#b58a57', 0.9

    @layer.addChild @container

  drawCenteredRect: (item, fill, alpha = 1) ->
    left = item.x - item.width / 2
    bottom = item.y - item.height / 2
    @drawWorldRect left, bottom, item.width, item.height, fill, alpha

  drawWorldRect: (x, y, width, height, fill, alpha = 1) ->
    bottomLeft = @camera.worldToSurface {x, y}
    topRight = @camera.worldToSurface {x: x + width, y: y + height}
    shape = new createjs.Shape()
    shape.alpha = alpha
    shape.graphics.beginFill(fill).drawRect(
      Math.min(bottomLeft.x, topRight.x),
      Math.min(bottomLeft.y, topRight.y),
      Math.abs(topRight.x - bottomLeft.x),
      Math.abs(topRight.y - bottomLeft.y)
    ).endFill()
    @container.addChild shape
