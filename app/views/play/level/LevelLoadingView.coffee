require('app/styles/play/level/level-loading-view.sass')
CocoView = require 'views/core/CocoView'
template = require 'app/templates/play/level/level-loading-view'
ace = require('lib/aceContainer')
utils = require 'core/utils'
aceUtils = require 'core/aceUtils'
aetherUtils = require 'lib/aether_utils'
SubscribeModal = require 'views/core/SubscribeModal'
LevelGoals = require('./LevelGoals').default
store = require 'core/store'

module.exports = class LevelLoadingView extends CocoView
  id: 'level-loading-view'
  template: template

  events:
    'mousedown .start-level-button': 'startUnveiling'  # Split into two for animation smoothness.
    'click .start-level-button': 'onClickStartLevel'
    'click .start-subscription-button': 'onClickStartSubscription'

  subscriptions:
    'level:loaded': 'onLevelLoaded'  # If Level loads after level loading view.
    'level:session-loaded': 'onSessionLoaded'
    'level:subscription-required': 'onSubscriptionRequired'  # If they'd need a subscription.
    'level:course-membership-required': 'onCourseMembershipRequired'  # If they need to be added to a course.
    'level:license-required': 'onLicenseRequired' # If they need a license.
    'level:locked': 'onLevelLocked'
    'subscribe-modal:subscribed': 'onSubscribed'

  shortcuts:
    'enter': 'onEnterPressed'

  initialize: (options={}) ->
    @utils = utils
    @loadingWingClass = _.sample(['alejandro', 'anya', 'chess', 'naria', 'okar'])
    @showOzaria = utils.showOzaria()
    @showCoco = !@showOzaria
    if @showCoco
      @$el.addClass 'coco-view'
    else
      @$el.addClass 'ozar-view'

  afterRender: ->
    super()
    return if @showOzaria
    unless @level?.get('loadingTip')
      @$el.find('.tip.rare').remove() if _.random(1, 10) < 9
      tips = @$el.find('.tip').addClass('to-remove')
      tip = _.sample(tips)
      $(tip).removeClass('to-remove').addClass('secret')
      @$el.find('.to-remove').remove()
    @onLevelLoaded level: @options.level if @options.level?.get('goals')  # If Level was already loaded.
    @configureACEEditors()

  configureACEEditors: ->
    codeLanguage = @session?.get('codeLanguage') or me.get('aceConfig')?.language or 'python'
    oldEditor.destroy() for oldEditor in @aceEditors ? []
    @aceEditors = []
    aceEditors = @aceEditors
    @$el.find('pre:has(code[class*="lang-"])').each ->
      aceEditor = aceUtils.initializeACE @, codeLanguage
      aceEditors.push aceEditor

  afterInsert: ->
    super()

  onLevelLoaded: (e) ->
    return if @level
    @level = e.level
    @$el.toggleClass 'codecombat-junior', @level.get('product', true) is 'codecombat-junior'
    @$el.toggleClass 'codecombat', @level.get('product', true) is 'codecombat'
    if @showCoco and @level.get('product', true) is 'codecombat'
      @prepareGoals e
      @prepareTip()
      @prepareIntro()
    else if @level.get('product', true) is 'codecombat-junior'
      @prepareLevelName()

  onSessionLoaded: (e) ->
    return if @session
    @session = e.session if e.session.get('creator') is me.id

  prepareLevelName: ->
    name = utils.i18n(@level.attributes, 'displayName') or utils.i18n(@level.attributes, 'name')
    @$el.find('.level-name').text(name).show()

  prepareGoals: ->
    @levelGoalsComponent = new LevelGoals({
      el: @$('.list-unstyled')[0],
      store,
      propsData: { showStatus: false }
    })
    @levelGoalsComponent.goals = @level.get('goals')
    goalContainer = @$el.find('.level-loading-goals')
    @buttonTranslationKey = 'play_level.loading_start'
    if @level.get('assessment') is 'cumulative'
      @buttonTranslationKey = 'play_level.loading_start_combo'
    else if @level.get('assessment')
      @buttonTranslationKey = 'play_level.loading_start_concept'
    @$('.start-level-button').text($.i18n.t(@buttonTranslationKey))

    Vue.nextTick(=>
      numGoals = goalContainer.find('li').length
      if numGoals
        goalContainer.removeClass('secret')
        if @level.get('assessment') is 'cumulative'
          if numGoals > 1
            @goalHeaderTranslationKey = 'play_level.combo_challenge_goals'
          else
            @goalHeaderTranslationKey = 'play_level.combo_challenge_goal'
        else if @level.get('assessment')
          if numGoals > 1
            @goalHeaderTranslationKey = 'play_level.concept_challenge_goals'
          else
            @goalHeaderTranslationKey = 'play_level.concept_challenge_goal'
        else
          if numGoals > 1
            @goalHeaderTranslationKey = 'play_level.goals'
          else
            @goalHeaderTranslationKey = 'play_level.goal'
        goalContainer.find('.goals-title').text $.i18n.t @goalHeaderTranslationKey
    )

  prepareTip: ->
    tip = @$el.find('.tip')
    if @level.get('loadingTip')
      loadingTip = utils.i18n @level.attributes, 'loadingTip'
      loadingTip = marked(loadingTip)
      tip.html(loadingTip).removeAttr('data-i18n')
    tip.removeClass('secret')

  prepareIntro: ->
    @docs = @level.get('documentation') ? {}
    specific = @docs.specificArticles or []
    @intro = _.find specific, name: 'Intro'

  showReady: ->
    return if @shownReady
    @shownReady = true
    # Repository-owned ScriptVerse levels do not need CodeCombat's separate
    # Start Level gate. At this point PlayLevelView has already created the
    # Surface, Tome, controls and world, so use the normal unveil lifecycle
    # instead of deleting the loading view directly (which previously broke
    # Run/Submit and the HUD).
    scriptverseLevel = @level?.get('scriptverse') or @options.level?.get('scriptverse')
    if scriptverseLevel
      # ScriptVerse has no separate intro/start gate. Use the same full-unveil
      # path as CodeCombat, but do it in one step. Calling startUnveiling()
      # first schedules onClickStartLevel one second later; that second call can
      # race with PlayLevelView removing this view and leave the LOADING label
      # stranded. unveil(true) already publishes the unveiling event itself.
      _.delay (=>
        return if @destroyed or @unveiled
        @unveil true
      ), 100
      return
    if @showCoco
      _.delay @finishShowingReady, 100
    else
      @unveilPreviewTime = new Date().getTime()
      _.delay @startUnveiling, 100

  finishShowingReady: =>
    return if @destroyed
    showIntro = utils.getQueryVariable('intro')
    if showIntro?
      autoUnveil = not showIntro
    else
      autoUnveil = @options.autoUnveil or @session?.get('state').complete or @level.get('product', true) is 'codecombat-junior'
    if autoUnveil
      @startUnveiling()
      @unveil true
    else
      @playSound 'level_loaded', 0.75
      @$el.find('.progress').hide()
      @$el.find('.start-level-button').show()
      @unveil false

  startUnveiling: (e) ->
    if @showCoco
      @playSound 'menu-button-click'
      @unveiling = true
      Backbone.Mediator.publish 'level:loading-view-unveiling', {}
      _.delay @onClickStartLevel, 1000
    else
      levelSlug = @level?.get('slug') or @options?.level?.get('slug')
      timespent = (new Date().getTime() - @unveilPreviewTime) / 1000
      window.tracker?.trackEvent 'Finish Viewing Intro', {
        category: 'Play Level'
        label: 'level loading'
        level: levelSlug
        levelID: levelSlug
        timespent
      }
      details = @$('#loading-details')?[0]
      unless details?.style?.display == 'none'
        details?.style?.display = "none"
      Backbone.Mediator.publish 'level:loading-view-unveiled', view: @

  onClickStartLevel: (e) =>
    return if @destroyed
    @unveil true

  onEnterPressed: (e) ->
    return unless @shownReady and not @unveiled
    @startUnveiling()
    @onClickStartLevel()

  unveil: (full) ->
    return if @destroyed or @unveiled
    @unveiled = full
    @$loadingDetails = @$el.find('#loading-details')
    duration = parseFloat(@$loadingDetails.css 'transition-duration') * 1000
    unless @$el.hasClass 'unveiled'
      @$el.addClass 'unveiled'
      @unveilWings duration
    if full
      @unveilLoadingFull()
      _.delay @onUnveilEnded, duration
    else
      @unveilLoadingPreview duration

  unveilLoadingFull: ->
    unless @unveiling
      Backbone.Mediator.publish 'level:loading-view-unveiling', {}
      @unveiling = true
    if @$el.hasClass 'preview-screen'
      @$loadingDetails.css 'right', -@$loadingDetails.outerWidth(true)
    else
      @$loadingDetails.css 'top', -@$loadingDetails.outerHeight(true)
    @$el.removeClass 'preview-screen'
    $('#canvas-wrapper').removeClass 'preview-overlay'
    if @unveilPreviewTime
      levelSlug = @level?.get('slug') or @options.level?.get('slug')
      timespent = (new Date().getTime() - @unveilPreviewTime) / 1000
      window.tracker?.trackEvent 'Finish Viewing Intro', {
        category: 'Play Level'
        label: 'level loading'
        level: levelSlug
        levelID: levelSlug
        timespent
      }

  unveilLoadingPreview: (duration) ->
    return if @$el.hasClass 'preview-screen'
    $('#canvas-wrapper').addClass 'preview-overlay'
    @$el.addClass('preview-screen')
    @$loadingDetails.addClass('preview')
    @resize()
    @onWindowResize = _.debounce @onWindowResize, 700
    $(window).on 'resize', @onWindowResize
    if @intro
      @$el.find('.progress-or-start-container').addClass('intro-footer')
      @$el.find('#tip-wrapper').remove()
      _.delay @unveilIntro, duration
    @unveilPreviewTime = new Date().getTime()

  resize: ->
    goalsHeight = @$el.find('.level-loading-goals').outerHeight(true) or 0
    introDocHeight = @$el.find('.intro-doc-content').outerHeight(true) or 100
    maxHeight = Math.min $('#level-view').outerHeight(true), goalsHeight + introDocHeight + 100 + 0.11 * $(window).innerHeight() + 40
    maxHeight = Math.max maxHeight, 0.5 * $(window).innerHeight()
    minHeight = $('#code-area').outerHeight(true)
    if $('#code-area').offset().top > 100
      minHeight = $('#canvas-wrapper').outerHeight(true) + $('#control-bar-view').outerHeight(true)
    minHeight -= 10
    minHeight = Math.min minHeight, maxHeight
    @$el.css height: '100%'
    @$loadingDetails.css minHeight: minHeight, maxHeight: maxHeight
    if @intro
      $intro = @$el.find('.intro-doc')
      $intro.css maxHeight: maxHeight - goalsHeight - 100 - 0.11 * $(window).innerHeight()

  onWindowResize: ->
    @resize()

  unveilIntro: ->
    return unless @intro
    @$('.intro-doc-content').html marked(@intro.body or '')

  unveilWings: (duration) ->
    leftWing = @$el.find('.loading-wing.left')
    rightWing = @$el.find('.loading-wing.right')
    leftWing.css left: -leftWing.outerWidth(true)
    rightWing.css right: -rightWing.outerWidth(true)

  onUnveilEnded: =>
    return if @destroyed
    Backbone.Mediator.publish 'level:loading-view-unveiled', view: @

  onSubscriptionRequired: ->
    @$('.start-level-button').hide()
    @$('.start-subscription-button').show()

  onCourseMembershipRequired: ->
    @$('.start-level-button').hide()

  onLicenseRequired: ->
    @$('.start-level-button').hide()

  onLevelLocked: ->
    @$('.start-level-button').hide()

  onSubscribed: ->
    @$('.start-subscription-button').hide()
    @$('.start-level-button').show()

  onClickStartSubscription: ->
    @openModalView new SubscribeModal()

  onLoadError: (resource) ->
    console.error 'Level loading failed:', resource
