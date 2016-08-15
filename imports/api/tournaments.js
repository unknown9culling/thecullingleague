import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'

export const Tournaments = new Mongo.Collection('tournaments')

Meteor.methods({
  'tournaments.joinTournament'(steamId, tournamentId) {
    check(steamId, String)
    check(tournamentId, Number)
    if(!this.userId) {
      throw new Meteor.Error('not-authorized')
    }
  }
})
