import '../imports/ui/header.html'
import '../imports/ui/footer.html'
import '../imports/ui/layout.html'
import '../imports/ui/index.html'
import '../imports/ui/faq.html'
import '../imports/ui/about.html'
import '../imports/ui/leaderboard.html'
import { Router } from 'meteor/iron:router'
import { Template } from 'meteor/templating'
import { Tournaments } from '../imports/api/tournaments.js'
import { Games } from '../imports/api/games.js'
import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
import { jstz } from './lib/jstz.min'

Router.configure({
  layoutTemplate: 'layout'
})

Router.route('/', function () {
  this.render('index')
})

Router.route('/faq', function () {
  this.render('faq')
})

Router.route('/about', function () {
  this.render('about')
})

Router.route('/leaderboard', function() {
  this.render('leaderboard')
})

Template.body.onCreated(function() {
  Meteor.subscribe('games')
  Meteor.subscribe('tournaments')
})

Template.header.events({
  'click #login-button': function() {
    Meteor.loginWithSteam()
  },
  'click #logout': function() {
    Meteor.logout()
  }
})

Template.index.events({
  'click #login-button': function() {
    Meteor.loginWithSteam()
  }
})

Template.index.helpers({
  tournaments() {
    region = Meteor.user().region
    if(region) {
      return Tournaments.find({active: true, region: region})
    } else {
      return Tournaments.find({active: true})
    }
  }
})

Template.leaderboard.helpers({
  leaderboard() {
    rankVar = 'rank.' + Meteor.user().region || 'north-america'
    toFind = {}
    toFind[rankVar] = {$gt: 0}
    return Meteor.users.find(toFind)
  },
  add1(x) {
    return x + 1
  }
})

Template.tournament.helpers({
  formatDate(date) {
    let format = 'MMMM Do, YYYY h:mm a z'
    let timezone = jstz.determine().name()
    return timezone ? moment(date).tz(timezone).format(format) : time.format(format)
  },
  players() {
    return this.playersWithInfo()
  },
  isRegistered() {
    return this.players.indexOf(Meteor.userId()) !== -1
  },
  region() {
    if(this.region === 'north-america') {
      return 'North America'
    } else if(this.region === 'europe') {
      return 'Europe'
    } else if(this.region === 'oceania') {
      return 'Oceania'
    } else if(this.region === '') {
      return 'All Regions'
    } else {
      return 'Other'
    }
  }
})

Template.tournament.events({
  'click .leave-tournament': function() {
    Meteor.call('tournaments.leaveTournament', this._id)
  },
  'click .join-tournament': function() {
    Meteor.call('tournaments.joinTournament', this._id)
  }
})

Template.currentgame.helpers({
  currentGame() {
    return Games.findOne({
      active: true
    })
  },
  momentUntil(date) {
    return moment(date).from(TimeSync.serverTime())
  }
})

Template['report-score-modal'].helpers({
  currentGame() {
    return Games.findOne({
      players: {
        $in: [Meteor.userId()]
      }
    })
  }
})

Template['report-player-modal'].helpers({
  currentGame() {
    return Games.findOne({
      players: {
        $in: [Meteor.userId()]
      }
    })
  }
})

Template.header.events({
  'click .modal-button': function(event, template) {
    var name = template.$(event.target).data('modal-template')
    Session.set('activeModal', name)
  }
})

Template.header.helpers({
  rankingPoints(currentUser) {
    return currentUser.rank[currentUser.region || 'north-america']
  }
})

Template.index.events({
  'click .modal-button': function(event, template) {
    var name = template.$(event.target).data('modal-template')
    Session.set('activeModal', name)
  },
  'click .page-cover': function() {
    Session.set('activeModal')
  },
  'click .report-winner': function(event, template) {
    playerId = template.$(event.target).data('id')
    gameId = template.$(event.target).data('game-id')
    Meteor.call('votes.voteForWinner', gameId, playerId)
  },
  'click .set-region': function(event, template) {
    Meteor.call('users.setRegion', template.$(event.target).data('region'))
  }
})

Template.modal.helpers({
  activeModal: function() {
    return Session.get('activeModal')
  }
})
