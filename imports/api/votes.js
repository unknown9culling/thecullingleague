import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Games } from './games'

export const Votes = new Mongo.Collection('votes')

Meteor.methods({
  'votes.voteForWinner'(gameId, winner) {
    check(gameId, String)
    check(winner, String)

    var gameToVoteFor = Games.findOne({_id: gameId})

    if(!gameToVoteFor) {
      throw new Meteor.Error('not-found')
    }

    if(gameToVoteFor.players.indexOf(winner) === -1) {
      throw new Meteor.Error('player-not-found')
    }

    if(!gameToVoteFor.active) {
      throw new Meteor.Error('cannot-vote-on-inactive-game')
    }

    otherVotesByPlayerCount = Votes.find({
      gameId: gameId,
      player: winner
    }).count()

    if(otherVotesByPlayerCount > 0) {
      throw new Meteor.Error('cant-vote-twice')
    }

    Votes.insert({
      gameId: gameId,
      player: winner
    })
  }
})
