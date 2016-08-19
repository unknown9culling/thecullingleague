import { Games } from '../api/games'
import { Tournaments } from '../api/tournaments'

import { getGames } from '../util/get_games'
import { TheCullingUS } from '../lib/theculling'
import moment from 'moment'

var gameStart = function(game) {
  if(TheCullingUS.busy === false) {
    console.log('starting game')
    TheCullingUS.launchGame(game.players.length, Meteor.bindEnvironment(function(err, code) {
      console.log('got code: ' + code)
      if(err) {
        Games.update({_id: game._id}, {$set: {status: 'Errored'}})
      } else {
        Games.update({_id: game._id}, {$set: {code: code}})
      }
    }))
    Games.update({_id: game._id}, {$set: {started: true}})
  } else {
    console.log('BUSY!')
  }
}

var tournamentStart = function(tournament) {
  if(tournament.players.length > 0) {
    Games.insert({
      tournamentId: tournament._id,
      players: tournament.players,
      round: 1,
      started: false,
      status: 'Active',
      active: true
    })
    Tournaments.update({_id: tournament._id}, {$set: {started: true}})
  } else {
    Tournaments.update({_id: tournament._id}, {$set: {active: false}})
  }
}

var checkForTournamentStart = function() {
  var activeTournaments = Tournaments.find({started: false})
  activeTournaments.forEach(function(tournament) {
    if(new Date() > new Date(tournament.endRegister)) {
      tournamentStart(tournament)
    }
  })
}

var checkForGameStart = function() {
  var activeGames = Games.find({started: false})

  activeGames.forEach(function(game) {
    gameStart(game)
  })
}

SyncedCron.add({
  name: 'Check for tournament start',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 2 seconds')
  },
  job: checkForTournamentStart
})

SyncedCron.add({
  name: 'Check for game start',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 2 seconds')
  },
  job: checkForGameStart
})

// call it once for the first time
checkForTournamentStart()
checkForGameStart()
