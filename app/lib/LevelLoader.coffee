Level = require 'models/Level'
LevelComponent = require 'models/LevelComponent'
LevelSystem = require 'models/LevelSystem'
Article = require 'models/Article'
LevelSession = require 'models/LevelSession'
CourseInstance = require 'models/CourseInstance'
Classroom = require 'models/Classroom'
{me} = require 'core/auth'
ThangType = require 'models/ThangType'
ThangTypeConstants = require 'lib/ThangTypeConstants'
ThangNamesCollection = require 'collections/ThangNamesCollection'
LZString = require 'lz-string'
scriptverseLevelRegistry = require 'lib/scriptverse/levelRegistry'

CocoClass = require 'core/CocoClass'
AudioPlayer = require 'lib/AudioPlayer'
World = require 'lib/world/world'
utils = require 'core/utils'
loadAetherLanguage = require 'lib/loadAetherLanguage'
aetherUtils = require 'lib/aether_utils'

LOG = false

# This is an initial stab at unifying loading and setup into a single place which can
# monitor everything and keep a LoadingScreen visible overall progress.
#
# Would also like to incorporate into here:
#  * World Building
#  * Sprite map generation
#  * Connecting to Firebase

# LevelLoader depends on SuperModel retrying timed out requests, as these occasionally happen during play.
# If LevelLoader ever moves away from SuperModel, it will have to manage its own retries.

reportedLoadErrorAlready = false

module.exports = class LevelLoader extends CocoClass

  constructor: (options) ->
    @t0 = new Date().getTime()
    super()
    @supermodel = options.supermodel
    @supermodel.setMaxProgress 0.2
    @levelID = options.levelID
    @sessionID = options.sessionID
    @opponentSessionID = options.opponentSessionID
    @tournament = options.tournament ? false
    @team = options.team
    @headless = options.headless
    @loadArticles = options.loadArticles
    @sessionless = options.sessionless
    @fakeSessionConfig = options.fakeSessionConfig
    @spectateMode = options.spectateMode ? false
    @observing = options.observing
    @courseID = options.courseID
    @courseInstanceID = options.courseInstanceID
    @classroomId = options.classroomId
    @thangsOverride = options.thangsOverride

    @worldNecessities = []
    @listenTo @supermodel, 'resource-loaded', @onWorldNecessityLoaded
    @listenTo @supermodel, 'failed', @onWorldNecessityLoadFailed
    @loadLevel()
    @loadAudio()
    @playJingle()
    if @supermodel.finished() and @level.loaded
      @onSupermodelLoaded()
    else
      @loadTimeoutID = setTimeout @reportLoadError.bind(@), 30000
      @listenToOnce @supermodel, 'loaded-all', @onSupermodelLoaded

  # Supermodel (Level) Loading

  loadWorldNecessities: ->
    # TODO: Actually trigger loading, instead of in the constructor
    new Promise((resolve, reject) =>
      return resolve(@) if @world
      @once 'world-necessities-loaded', => resolve(@)
      @once 'world-necessity-load-failed', ({resource}) ->
        { jqxhr } = resource
        reject({message: jqxhr.responseJSON?.message or jqxhr.responseText or 'Unknown Error'})
    )

  loadLevel: ->
    if scriptverseLevelRegistry.hasLevel @levelID
      attributes = scriptverseLevelRegistry.getLevelAttributes @levelID
      attributes._id = @levelID
      attributes.original ?= @levelID
      attributes.version ?= {major: 0, minor: 1}
      @level = new Level attributes
      @level.loaded = true
      @supermodel.trackModel @level
      console.debug 'LevelLoader: loaded ScriptVerse repository level:', @level if LOG
      @onLevelLoaded()
      return

    @level = @supermodel.getModel(Level, @levelID) or new Level _id: @levelID
    if @level.loaded
      console.debug 'LevelLoader: level already loaded:', @level if LOG
      @onLevelLoaded()
    else
      console.debug 'LevelLoader: loading level:', @level if LOG
      @level = @supermodel.loadModel(@level, 'level', { data: { cacheEdge: true } }).model
      @listenToOnce @level, 'sync', @onLevelLoaded


  loadClassroomIfNecessary: ->
    if @headless and not @level?.isType('web-dev')
      @onAccessibleLevelLoaded()
      return

    if not @classroomId and not @courseInstanceID
      isAILeague = @tournament or @team or @spectateMode or utils.getQueryVariable 'league'
      if !me.isStudent() or isAILeague
        @onAccessibleLevelLoaded()
      else
        noty({
          text: $.i18n.t('courses.no_classrooms_found'),
          type: 'error',
          timeout: 5000,
        })
      return

    if @courseInstanceID and not @classroomId
      @courseInstance = new CourseInstance({_id: @courseInstanceID})
      @supermodel.trackModel(@courseInstance)
      @courseInstance.fetch().then =>
        @classroomId = @courseInstance.get('classroomID')
        @classroomIdLoaded()
    else
      @classroomIdLoaded()

  classroomIdLoaded: ->
    @classroom = new Classroom({_id: @classroomId})
    @supermodel.trackModel(@classroom)
    @classroom.fetch().then =>
      return if @destroyed
      @classroomLoaded()

  classroomLoaded: ->
    locked = @classroom.isStudentOnLockedLevel(me.get('_id'), @courseID, @level.get('original'))
    if locked
      Backbone.Mediator.publish 'level:locked', level: @level
    else 
      @onAccessibleLevelLoaded()

  reportLoadError: ->
    return if @destroyed
    window.tracker?.trackEvent 'LevelLoadError',
      category: 'Error'
      levelSlug: @work?.level?.slug
      unloaded: JSON.stringify(@supermodel.report().map (m) -> _.result(m.model, 'url'))
  
  onLevelLoaded: ->
    @loadClassroomIfNecessary()

  onAccessibleLevelLoaded: ->
    console.debug 'LevelLoader: loaded level:', @level if LOG
    @level.set('thangs', @thangsOverride) if @thangsOverride
    if not @sessionless and @level.isType('hero', 'hero-ladder', 'hero-coop', 'course')
      @sessionDependenciesRegistered = {}
    if @level.isType('web-dev')
      @headless = true
      if @sessionless
        # When loading a web-dev level in the level editor, pretend it's a normal hero level so we can put down our placeholder Thang.
        # TODO: avoid this whole roundabout Thang-based way of doing web-dev levels
        originalGet = @level.get
        @level.get = ->
          return 'hero' if arguments[0] is 'type'
          return 'web-dev' if arguments[0] is 'realType'
          originalGet.apply @, arguments
    # I think the modification from https://github.com/codecombat/codecombat/commit/09e354177cb5df7e82cc66668f4c9b6d66d1d740#diff-0aef265179ff51db5b47a0f5be07eea7765664222fcbea6780439f50cd374209L105-R105
    # Can go to Ozaria as well
    if (@courseID and not @level.isType('course', 'course-ladder', 'game-dev', 'web-dev', 'ladder'))
      # Because we now use original hero levels for both hero and course levels, we fake being a course level in this context.
      originalGet = @level.get
      realType = @level.get('type')
      @level.get = ->
        return 'course' if arguments[0] is 'type'
        return realType if arguments[0] is 'realType'
        originalGet.apply @, arguments
    if @sessionless
      null
    else if @fakeSessionConfig?
      @loadFakeSession()
    else
      @loadSession()
    @populateLevel()

  # Session Loading
