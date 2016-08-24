import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'

export const Tournaments = new Mongo.Collection('tournaments')

Tournaments.helpers({
  playersWithInfo() {
    if(this.players.length === 0) {
      return []
    }
    playerOr = this.players.map(function(player) {
      return {'_id': player}
    })
    return Meteor.users.find({$or: playerOr})
  },
  openForRegistration() {
    return new Date() > new Date(this.endRegister)
  }
})

Meteor.methods({
  'tournaments.joinTournament'(tournamentId) {
    check(tournamentId, String)
    if(!this.userId) {
      throw new Meteor.Error('not-authorized')
    }

    var tournamentToJoin = Tournaments.findOne({_id: tournamentId})

    if(!tournamentToJoin) {
      throw new Meteor.Error('not-found')
    }

    if(!tournamentToJoin.players) {
      tournamentToJoin.players = []
    }
    if(tournamentToJoin.players.indexOf(this.userId) === -1) {
      Tournaments.update({_id: tournamentToJoin._id}, {$push: {players: this.userId, players_left: this.userId}})
    }
  },
  'tournaments.leaveTournament'(tournamentId) {
    check(tournamentId, String)
    if(!this.userId) {
      throw new Meteor.Error('not-authorized')
    }

    var tournamentToJoin = Tournaments.findOne({_id: tournamentId})

    if(!tournamentToJoin) {
      throw new Meteor.Error('not-found')
    }

    if(!tournamentToJoin.players) {
      tournamentToJoin.players = []
    }
    if(tournamentToJoin.players.indexOf(this.userId) !== -1) {
      Tournaments.update({_id: tournamentToJoin._id}, {$pull: {players: this.userId, players_left: this.userId}})
    }
  }
})
