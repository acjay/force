_ = require 'underscore'
allSteps = _.keys(require './views.coffee')
hasSeen = (steps...) -> ({ logger }) -> logger.hasLogged steps...
hasSeenThisSession = (steps...) -> ({ logger }) -> logger.hasLoggedThisSession steps...

decisions =
  pre_qualify: ({ artwork }) ->
    artwork.related()
      .partner.get('pre_qualify') is true

  is_collector: ({ user }) ->
    user.isCollector()

  help_by: ({ state }) ->
    state.get 'value'

  has_basic_info: ({ user }) ->
    user.has('profession') and
    user.has('location') and
    user.has('phone')

  is_logged_in: ({ user }) ->
    user.isLoggedIn()

  has_completed_profile: ({ logger, user }) ->
    steps = [
      'commercial_interest'
      'basic_info'
    ]

    if user.isCollector()
      steps = steps.concat [
        'artists_in_collection'
        'galleries_you_work_with'
        'auction_houses_you_work_with'
        'fairs_you_attend'
        'institutional_affiliations'
      ]

    logger.hasLogged steps...

module.exports = _.reduce allSteps, (memo, step) ->
  memo["has_seen_#{step}"] = hasSeen step
  memo["has_seen_#{step}_this_session"] = hasSeenThisSession step
  memo
, decisions