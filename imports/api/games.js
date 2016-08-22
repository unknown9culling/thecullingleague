import { Mongo } from 'meteor/mongo'
import { Tournaments } from './tournaments'
import { Votes } from './votes'

export const Games = new Mongo.Collection('games')

Games.helpers({
  tournament() {
    return Tournaments.findOne({_id: this.tournamentId})
  },
  winner() {
    return Votes.findOne({
      gameId: this._id
    }, {sort: {_id:-1}}).player
  }
})
