import '../imports/ui/header.html'
import '../imports/ui/footer.html'
import '../imports/ui/layout.html'
import '../imports/ui/index.html'
import '../imports/ui/faq.html'
import '../imports/ui/about.html'
import { Router } from 'meteor/iron:router'
import { Template } from 'meteor/templating'
import { Tournaments } from '../imports/api/tournaments.js'
import { Games } from '../imports/api/games.js'
import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'

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

Template.header.events({
  'click #login-button': function() {
    Meteor.loginWithSteam()
  }
})

Template.index.events({
  'click #login-button': function() {
    Meteor.loginWithSteam()
  }
})

Template.index.helpers({
  tournaments() {
    return Tournaments.find({active: true})
  }
})

Template.tournament.helpers({
  formatDate(date) {
    return moment(date).format('MMMM Do YYYY, h:mm a')
  },
  players() {
    return this.playersWithInfo()
  },
  isRegistered() {
    return this.players.indexOf(Meteor.userId()) !== -1
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
      players: {
        $in: [Meteor.userId()]
      }
    })
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

Template.index.events({
  'click .modal-button': function(event, template) {
    var name = template.$(event.target).data('modal-template')
    Session.set('activeModal', name)
  },
  'click .page-cover': function() {
    Session.set('activeModal')
  }
})

Template.modal.helpers({
  activeModal: function() {
    return Session.get('activeModal')
  }
})
