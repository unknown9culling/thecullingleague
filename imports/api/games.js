import { Mongo } from 'meteor/mongo'
import { Tournaments } from './tournaments'
import { Votes } from './votes'

export const Games = new Mongo.Collection('games')

if (Meteor.isServer) {
  Meteor.publish('games', function() {
    return Games.find({
      players: this.userId,
      $or: [
        { active: true },
        { eliminated: true }
      ]
    })
  })
}

Games.helpers({
  tournament() {
    return Tournaments.findOne({_id: this.tournamentId})
  },
  winner() {
    var possibleWinners = Votes.find({
      gameId: this._id
    })
    var winnerMap = {}
    possibleWinners.forEach(function(winner) {
      if(!winnerMap.hasOwnProperty(winner.player)) {
        winnerMap[winner.player] = 1
      } else {
        winnerMap[winner.player] += 1
      }
    })
    if(Object.keys(winnerMap).length === 0) {
      return null
    }
    var winner = Object.keys(winnerMap).reduce(function(a, b){ return winnerMap[a] > winnerMap[b] ? a : b })
    return winner
  },
  playersWithInfo() {
    if(this.players.length === 0) {
      return []
    }
    playerOr = this.players.map(function(player) {
      return {'_id': player}
    })
    return Meteor.users.find({$or: playerOr})
  }
})
