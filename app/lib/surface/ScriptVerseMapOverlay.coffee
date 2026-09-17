CocoClass = require 'core/CocoClass'
createjs = require 'lib/createjs-parts'

# Lightweight original ScriptVerse terrain renderer. Semantic map coordinates
# remain the source of truth for visuals and physics. The complete procedural
# terrain is cached to a bitmap before entering StageGL: uncached CreateJS Shape
# vector graphics are not rendered by the engine's WebGL gameplay stage.
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
    @container?.uncache?()
    super()

  build: ->
    @container = new createjs.Container()
    @container.mouseEnabled = false

    geometry = @map.geometry or {}
    return unless geometry.width? and geometry.height?
    @drawTerrain geometry

    # Paths first so camp objects sit naturally above them.
    for item in (@map.scenery or []) when item.kind is 'path'
      @drawPath item
    for item in (@map.scenery or []) when item.kind is 'water'
      @drawRiver item
    for item in (@map.scenery or []) when item.kind is 'tent-cluster'
      @drawTentCluster item
    for item in (@map.scenery or []) when item.kind is 'officers-area'
      @drawOfficersArea item

    # StageGL cannot display ordinary uncached Shape vector graphics. Rasterize
    # this original ScriptVerse terrain once, then let the native Land layer
    # transform the cached bitmap together with the world/camera.
    bounds = @worldSurfaceBounds geometry
    padding = 8
    @container.cache bounds.x - padding, bounds.y - padding, bounds.width + padding * 2, bounds.height + padding * 2, 1
    @layer.addChild @container

  worldSurfaceBounds: (geometry) ->
    a = @camera.worldToSurface {x: 0, y: 0}
    b = @camera.worldToSurface {x: geometry.width, y: geometry.height}
    {
      x: Math.min(a.x, b.x)
      y: Math.min(a.y, b.y)
      width: Math.abs(b.x - a.x)
      height: Math.abs(b.y - a.y)
    }

  surfaceBounds: (item) ->
    left = item.x - item.width / 2
    bottom = item.y - item.height / 2
    a = @camera.worldToSurface {x: left, y: bottom}
    b = @camera.worldToSurface {x: left + item.width, y: bottom + item.height}
    {
      x: Math.min(a.x, b.x)
      y: Math.min(a.y, b.y)
      width: Math.abs(b.x - a.x)
      height: Math.abs(b.y - a.y)
    }

  drawTerrain: (geometry) ->
    b = @worldSurfaceBounds geometry
    ground = new createjs.Shape()
    ground.graphics.beginFill('#b9955d').drawRect(b.x, b.y, b.width, b.height).endFill()
    @container.addChild ground

    texture = new createjs.Shape()
    g = texture.graphics
    for i in [0...80]
      px = b.x + ((i * 73) % 97) / 97 * b.width
      py = b.y + ((i * 47) % 89) / 89 * b.height
      r = 1 + (i % 3)
      g.beginFill(if i % 2 then '#a98450' else '#c5a46d').drawCircle(px, py, r).endFill()
    texture.alpha = 0.38
    @container.addChild texture

  drawPath: (item) ->
    b = @surfaceBounds item
    path = new createjs.Shape()
    path.graphics.beginFill('#d0b77f').drawRoundRect(b.x, b.y, b.width, b.height, Math.min(14, b.width / 3, b.height / 3)).endFill()
    path.alpha = 0.82
    @container.addChild path

  drawRiver: (item) ->
    b = @surfaceBounds item
    river = new createjs.Shape()
    river.graphics.beginFill('#397d96').drawRect(b.x, b.y, b.width, b.height).endFill()
    @container.addChild river

    waves = new createjs.Shape()
    g = waves.graphics.setStrokeStyle(2).beginStroke('#7fb8c7')
    step = Math.max 18, b.height / 12
    yy = b.y + 12
    while yy < b.y + b.height
      g.mt(b.x + 5, yy).curveTo(b.x + b.width * 0.35, yy - 5, b.x + b.width * 0.65, yy + 4).lt(b.x + b.width - 5, yy)
      yy += step
    g.endStroke()
    waves.alpha = 0.65
    @container.addChild waves

  drawTentCluster: (item) ->
    b = @surfaceBounds item
    cols = Math.max 1, Math.round(item.width / 4)
    rows = Math.max 1, Math.round(item.height / 3)
    cellW = b.width / cols
    cellH = b.height / rows
    for row in [0...rows]
      for col in [0...cols]
        cx = b.x + cellW * (col + 0.5)
        cy = b.y + cellH * (row + 0.55)
        @drawTent cx, cy, Math.min(cellW * 0.72, 54), Math.min(cellH * 0.7, 36)

  drawTent: (cx, cy, width, height) ->
    shadow = new createjs.Shape()
    shadow.graphics.beginFill('#6f5538').drawEllipse(cx - width * 0.48, cy + height * 0.18, width * 0.96, height * 0.35).endFill()
    shadow.alpha = 0.35
    @container.addChild shadow

    tent = new createjs.Shape()
    g = tent.graphics
    g.beginFill('#d8c29a').mt(cx - width / 2, cy + height / 2).lt(cx, cy - height / 2).lt(cx + width / 2, cy + height / 2).closePath().endFill()
    g.beginStroke('#6f5134').setStrokeStyle(2).mt(cx, cy - height / 2).lt(cx, cy + height / 2).endStroke()
    g.beginFill('#6e4b32').mt(cx - width * 0.12, cy + height / 2).lt(cx, cy + height * 0.08).lt(cx + width * 0.12, cy + height / 2).closePath().endFill()
    @container.addChild tent

  drawOfficersArea: (item) ->
    b = @surfaceBounds item
    mat = new createjs.Shape()
    mat.graphics.beginFill('#8d6843').drawRoundRect(b.x, b.y, b.width, b.height, 8).endFill()
    mat.alpha = 0.55
    @container.addChild mat
    @drawTent b.x + b.width / 2, b.y + b.height / 2, Math.min(72, b.width * 0.65), Math.min(48, b.height * 0.65)
