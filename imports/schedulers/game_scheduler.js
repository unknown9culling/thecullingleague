import { Games } from '../api/games'
import { Tournaments } from '../api/tournaments'

import { getGames } from '../util/get_games'
import { TheCullingUS } from '../lib/theculling'
import moment from 'moment'

var gameStart = function(game) {
  if(TheCullingUS.busy === false) {
    TheCullingUS.launchGame(game.players.length, Meteor.bindEnvironment(function(err, data) {
      code = data.code
      members = data.players
      if(err) {
        Games.update({_id: game._id}, {$set: {status: 'Errored'}})
      } else {
        Games.update({_id: game._id}, {$set: {code: code}})
      }
    }))
    Games.update({_id: game._id}, {$set: {started: true}})
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
      active: true,
      toJoin: moment().add(5, 'minutes').toDate(),
      gameEnd: moment().add(30, 'minutes').toDate()
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
