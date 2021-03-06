Q = require 'bluebird-q'
Backbone = require 'backbone'
Cookies = require 'cookies-js'
metaphysics = require '../../../../lib/metaphysics.coffee'
mediator = require '../../../lib/mediator.coffee'
CurrentUser = require '../../../models/current_user.coffee'
HeroUnitView = require './hero_unit_view.coffee'
HomeAuthRouter = require './auth_router.coffee'
JumpView = require '../../../components/jump/view.coffee'
SearchBarView = require '../../../components/search_bar/view.coffee'
setupHomePageModules = require './setup_home_page_modules.coffee'
maybeShowBubble = require '../components/new_for_you/index.coffee'
setupArtistsToFollow = require '../components/artists_to_follow/index.coffee'
Articles = require '../../../collections/articles'
Items = require '../../../collections/items'
featuredArticlesTemplate = -> require('../templates/featured_articles.jade') arguments...
featuredShowsTemplate = -> require('../templates/featured_shows.jade') arguments...
splitTest = require '../../../components/split_test/index.coffee'
{ resize } = require '../../../components/resizer/index.coffee'
sd = require('sharify').data
_ = require 'underscore'
_s = require 'underscore.string'

module.exports.HomeView = class HomeView extends Backbone.View
  events:
    'click #main-layout-search-bar-container': 'highlightSearch'
    'mousedown #main-layout-search-bar-button': 'trackClickingSearch'
    'blur #main-layout-search-bar-container': 'unhighlightSearch'
    'click #main-layout-search-bar-button': 'performSearch'

  initialize: ({ @testGroup }) ->
    # Set up a router for the /log_in /sign_up and /forgot routes
    new HomeAuthRouter
    Backbone.history.start pushState: true

    # Render Featured Sections
    if @testGroup is 'experiment' then @setupSearchBar() else @setupHeroUnits()
    @setupFeaturedShows()
    @setupFeaturedArticles()

  setupHeroUnits: ->
    new HeroUnitView
      el: @$el
      $mainHeader: $('#main-layout-header')

  setupFeaturedShows: ->
    featuredShows = new Items [], id: '530ebe92139b21efd6000071', item_type: 'PartnerShow'
    featuredShows.fetch().then (results) ->
        $("#js-home-featured-shows").html featuredShowsTemplate
          featuredShows: featuredShows
          resize: resize

  setupFeaturedArticles: ->
    featuredArticles = new Articles
    featuredArticles.fetch(
      data:
        published: true
        featured: true
        sort: '-published_at'
    ).then (results) ->
      $("#js-home-featured-articles").html featuredArticlesTemplate
        featuredArticles: featuredArticles
        resize: resize

  setupSearchBar: ->
    @$input = @$('#home-foreground #main-layout-search-bar-input')
    @$searchContainer = $('#home-foreground #main-layout-search-bar-container')
    @searchBarView = new SearchBarView
      el: @$searchContainer
      $input: @$input
      displayEmptyItem: true
      autoselect: true
      mode: 'suggest'
      limit: 7
      centeredHomepageSearch: true
      
    @searchBarView.on 'search:entered', (term) -> window.location = "/search?q=#{term}"
    @searchBarView.on 'search:selected', @searchBarView.selectResult
    throttledScroll = _.throttle((=> @onScroll()), 100)
    $(window).on 'scroll', throttledScroll
    @$input.focus()
    @highlightSearch({}, false)

  onScroll: ->
    if $(window).scrollTop() > 250
      @$('#main-layout-header #main-layout-search-bar-container').addClass('visible')
      @$('#main-layout-header').addClass('visible')
    else
      @$('#main-layout-header #main-layout-search-bar-container').removeClass('visible')
      @$('#main-layout-header').removeClass('visible')

  highlightSearch: (e, onlyOnFocus = true) ->
    return unless @$input?
    if onlyOnFocus
      @$searchContainer.addClass('focused') if @$input.is(':focus')
    else
      @$searchContainer.addClass('focused')

  unhighlightSearch: (e) ->
    $(e.currentTarget).removeClass('focused') unless @clickingSearch

  isEmpty: ->
    _.isEmpty(_s.trim(@$input.val()))

  trackClickingSearch: (e) ->
    @clickingSearch = true

  performSearch: (e) ->
    e.preventDefault()
    @clickingSearch = false
    if @isEmpty()
      @$input.focus()
      return
    term = @$input.val()
    window.location = "/search?q=#{term}"

module.exports.init = ->
  user = CurrentUser.orNull()
  splitTest('home_search_test').view()
  new HomeView el: $('body'), testGroup: sd.HOME_SEARCH_TEST

  setupHomePageModules()
  setupArtistsToFollow user
  maybeShowBubble user
