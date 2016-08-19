import { Mongo } from 'meteor/mongo'
import { Tournaments } from './tournaments'

export const Games = new Mongo.Collection('games')

Games.helpers({
  tournament() {
    return Tournaments.findOne({_id: this.tournamentId})
  }
})
