Backbone = require 'backbone'
_ = require 'underscore'
sd = require('sharify').data
moment = require 'moment'
noUiSlider = require 'nouislider'
analyticsHooks = require '../../../../../lib/analytics_hooks.coffee'

module.exports = class VeniceVideoView extends Backbone.View

  events:
    'click #toggleplay': 'onTogglePlay'
    'click #togglemute': 'onToggleMute'
    'click .venice-video__close': 'onCloseVideo'

  initialize: (options) ->
    @video = options.video
    @$playButton = $('#toggleplay')
    @$muteButton = $('#togglemute')
    @setupVideo()
    @on 'swapVideo', @swapVideo
    @scrubbing = false

  setupVideo: ->
    @vrView = new VRView.Player '#vrvideo',
      video: @video,
      is_stereo: false,
      is_vr_off: false,
      width: '100%',
      height: '100%',
      loop: false
    @vrView.on 'ready', @onVRViewReady
    @vrView.on 'timeupdate', @updateTime

  updateTime: (e) =>
    return if @scrubbing
    if e.currentTime > 3
      @trackThreeSeconds()
    if e.currentTime > 10
      @trackTenSeconds()
    if e.currentTime > @quarterDuration
      @trackQuarter()
    if e.currentTime > @halfDuration
      @trackHalf()
    if e.currentTime > @threeQuarterDuration
      @trackThreeQuarter()
    if e.currentTime is @fullDuration
      @trigger 'videoCompleted'
      @trackFull()
    @scrubber.set(e.currentTime)

  onVRViewReady: =>
    @duration = @vrView.getDuration()
    @setupAnalytics()
    @scrubber = noUiSlider.create $('.venice-video__scrubber')[0],
      start: 0
      behaviour: 'snap'
      range:
        min: 0
        max: @duration
    @scrubber.on 'start', =>
      @scrubbing = true
    @scrubber.on 'change', (value) =>
      @vrView.setCurrentTime parseFloat(value[0])
      @scrubbing = false
    @trigger 'videoReady'

  onTogglePlay: ->
    if @vrView.isPaused
      @vrView.play()
    else
      @vrView.pause()
    @$playButton.toggleClass 'paused'

  onToggleMute: ->
    if @$muteButton.attr('data-state') is 'muted'
      @vrView.setVolume 1
      @$muteButton.attr 'data-state', 'unmuted'
    else
      @vrView.setVolume 0
      @$muteButton.attr 'data-state', 'muted'

  swapVideo: (options) ->
    $('.venice-video__scrubber')[0].noUiSlider?.destroy()
    @vrView.iframe.src = @createIframeSrc options.video

  createIframeSrc: (video) ->
    "#{sd.APP_URL}/vanity/vrview/index.html?video=" +
    video +
    "&is_stereo=false&is_vr_off=false&loop=false"

  setupAnalytics: ->
    @quarterDuration = @duration * .25
    @halfDuration = @duration * .5
    @threeQuarterDuration = @duration * .75
    @fullDuration = @duration
    @trackQuarter = _.once ->
      analyticsHooks.trigger('video:duration',{duration: '25%'})
    @trackHalf = _.once ->
      analyticsHooks.trigger('video:duration',{duration: '50%'})
    @trackThreeQuarter = _.once ->
      analyticsHooks.trigger('video:duration',{duration: '75%'})
    @trackFull = _.once ->
      analyticsHooks.trigger('video:duration',{duration: '100%'})
    @trackThreeSeconds = _.once ->
      analyticsHooks.trigger('video:seconds',{seconds: '3'})
    @trackTenSeconds = _.once ->
      analyticsHooks.trigger('video:seconds',{seconds: '10'})

  onCloseVideo: ->
    @trigger 'closeVideo'

  # Currently unused but will implement next
  formatTime: (time) ->
    minutes = Math.floor(time / 60) % 60
    seconds = Math.floor(time % 60)
    minutes = if minutes <= 0 then 0 else minutes
    seconds = if seconds <= 0 then 0 else seconds

    result = (if minutes < 10 then '0' + minutes else minutes) + ':'
    result += if seconds < 10 then '0' + seconds else seconds