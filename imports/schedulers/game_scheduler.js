import { Games } from '../api/games'
import { Tournaments } from '../api/tournaments'

import { getGames } from '../util/get_games'
import { TheCullingUS, TheCullingEU, TheCullingOCN } from '../lib/theculling'
import moment from 'moment'

export var gameStart = function(game) {
  var cullingAPI
  if(game.region === 'north-america') {
    cullingAPI = TheCullingUS
  } else if(game.region === 'europe') {
    cullingAPI = TheCullingEU
  } else if(game.region === 'oceania') {
    cullingAPI = TheCullingOCN
  }
  if(cullingAPI.busy === false) {
    cullingAPI.launchGame(game.players.length, Meteor.bindEnvironment(function(err, data) {
      code = data.code
      members = data.players
      if(err) {
        Games.update({_id: game._id}, {$set: {status: 'Errored'}})
      } else {
        Games.update({_id: game._id}, {$set: {code: code}})
      }
    }), game.toJoin)
    Games.update({_id: game._id}, {$set: {started: true}})
  }
}

export var tournamentStart = function(tournament) {
  if(tournament.players_left.length > 0) {
    gamesToSchedule = getGames(tournament.players_left, 15)
    timeOffset = 0
    gamesToSchedule.forEach((game) => {
      var gameId = Games.insert({
        tournamentId: tournament._id,
        players: game,
        round: tournament.round,
        started: false,
        status: 'Active',
        active: true,
        eliminated: false,
        region: tournament.region,
        start: moment().add(timeOffset, 'minutes').toDate(),
        toJoin: moment().add(5, 'minutes').add(timeOffset, 'minutes').toDate(),
        gameEnd: moment().add(30, 'minutes').add(timeOffset, 'minutes').toDate()
      })
      timeOffset += 6 // leave about 5 minutes between starting games
    })
    Tournaments.update({_id: tournament._id}, {$set: {started: true}})
  } else {
    Tournaments.update({_id: tournament._id}, {$set: {active: false}})
  }
}

export var checkForTournamentStart = function() {
  var activeTournaments = Tournaments.find({started: false})
  activeTournaments.forEach(function(tournament) {
    if(new Date() > new Date(tournament.endRegister)) {
      tournamentStart(tournament)
    }
  })
}

export var checkForGameStart = function() {
  var activeGames = Games.find({started: false})

  activeGames.forEach(function(game) {
    if(new Date() > new Date(game.start)) {
      gameStart(game)
    }
  })
}

export var checkForRoundFinish = function() {
  var activeTournaments = Tournaments.find({started: true, active: true})
  activeTournaments.forEach(function(tournament) {
    var finishedGames = Games.find({active: false, tournamentId: tournament._id, round: tournament.round, eliminated: false})

    finishedGames.forEach(function(game) {
      var currentPlayers = tournament.players_left
      game.players.forEach(function(player) {
        if(player !== game.winner()) {
          currentPlayers.splice(currentPlayers.indexOf(player), 1)
        }
      })
      Tournaments.update({_id: game.tournamentId}, {$set: {players_left: currentPlayers}})
      tournament.players_left = currentPlayers
      Games.update({_id: game._id}, {$set: {eliminated: true}})
    })

    var stillGoing = Games.find({active: true, tournamentId: tournament._id, round: tournament.round}).count()
    if(stillGoing === 0) {
      if(tournament.players_left.length === 1) {
        tournament.winner = tournament.players_left[0]
        if(tournament.players_left[0] !== null) {
          rankVar = 'rank.' + tournament.region
          increment = {}
          increment[rankVar] = 1
          Meteor.users.update({'_id': tournament.players_left[0]}, {$inc: increment})
        }
        Tournaments.update({_id: tournament._id}, {$set: {winner: tournament.players_left[0], active: false}})
      } else if(tournament.players_left.length === 0) {
        Tournaments.update({_id: tournament._id}, {$set: {active: false}})
      } else {
        Tournaments.update({_id: tournament._id}, {$inc: {round: 1}})
        tournamentToScheduleGames = Tournaments.findOne({_id: tournament._id})
        tournamentStart(tournamentToScheduleGames)
      }
    }
  })
}

export var checkForGameEnd = function() {
  var games = Games.find({active: true})
  games.forEach(function(game) {
    if(new Date() > new Date(game.gameEnd)) {
      Games.update({_id: game._id}, {$set: {active: false}})
    }
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
  name: 'Check for round finish',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 2 seconds')
  },
  job: checkForRoundFinish
})

SyncedCron.add({
  name: 'Check for game finish',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 2 seconds')
  },
  job: checkForGameEnd
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
