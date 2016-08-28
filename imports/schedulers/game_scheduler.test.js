import StubCollections from 'meteor/hwillson:stub-collections'
import { Tournaments } from '../api/tournaments'
import { Games } from '../api/games'
import { Votes } from '../api/votes'
import { checkForTournamentStart, checkForGameStart, checkForRoundFinish } from './game_scheduler'
chai.should()
describe('Game scheduler', function() {
  beforeEach(function() {
    StubCollections.stub(Tournaments)
    StubCollections.stub(Votes)
    StubCollections.stub(Games)
    StubCollections.stub(Meteor.users)
  })
  describe('checkForTournamentStart', function() {
    it('should create a game if a tournament has enough players', function() {
      var player = Meteor.users.insert({})
      var player2 = Meteor.users.insert({})
      var tournament = Tournaments.insert({
        startDate: moment().subtract(2, 'minutes').toDate(),
        endRegister: moment().subtract(1, 'minutes').toDate(),
        tournamentName: 'Weekly ManTracker.co Tournament',
        tournamentDescription: 'Fight to the death in our ManTracker hosted weekly tournament. Every week, players will fight to win by joining the weekly tournament and earning points when they win. Play now!',
        slots: 64,
        region: 'north-america',
        started: false,
        active: true,
        players: [player, player2],
        players_left: [player, player2],
        round: 1
      })
      checkForTournamentStart()
      var numberOfGames = Games.find({tournamentId: tournament}).count()
      numberOfGames.should.equal(1)
    })
    it('should not create a game if a tournament does not have enough players', function() {
      var player = Meteor.users.insert({})
      var tournament = Tournaments.insert({
        startDate: moment().subtract(2, 'minutes').toDate(),
        endRegister: moment().subtract(1, 'minutes').toDate(),
        tournamentName: 'Weekly ManTracker.co Tournament',
        tournamentDescription: 'Fight to the death in our ManTracker hosted weekly tournament. Every week, players will fight to win by joining the weekly tournament and earning points when they win. Play now!',
        slots: 64,
        region: 'north-america',
        started: false,
        active: true,
        players: [player],
        players_left: [player],
        round: 1
      })
      checkForTournamentStart()
      var numberOfGames = Games.find({tournamentId: tournament}).count()
      numberOfGames.should.equal(0)
    })
    it('should create 2 games if a tournament has enough players', function() {
      players = []
      for(var x = 0; x < 32; x++) {
        var player = Meteor.users.insert({})
        players.push(player)
      }
      var tournament = Tournaments.insert({
        startDate: moment().subtract(2, 'minutes').toDate(),
        endRegister: moment().subtract(1, 'minutes').toDate(),
        tournamentName: 'Weekly ManTracker.co Tournament',
        tournamentDescription: 'Fight to the death in our ManTracker hosted weekly tournament. Every week, players will fight to win by joining the weekly tournament and earning points when they win. Play now!',
        slots: 64,
        region: 'north-america',
        started: false,
        active: true,
        players: players,
        players_left: players,
        round: 1
      })
      checkForTournamentStart()
      var numberOfGames = Games.find({tournamentId: tournament}).count()
      numberOfGames.should.equal(2)
    })
    it('should not start if no players are in the tournament', function() {
      var tournament = Tournaments.insert({
        startDate: moment().subtract(2, 'minutes').toDate(),
        endRegister: moment().subtract(1, 'minutes').toDate(),
        tournamentName: 'Weekly ManTracker.co Tournament',
        tournamentDescription: 'Fight to the death in our ManTracker hosted weekly tournament. Every week, players will fight to win by joining the weekly tournament and earning points when they win. Play now!',
        slots: 64,
        region: 'north-america',
        started: false,
        active: true,
        players: [],
        players_left: [],
        round: 1
      })
      checkForTournamentStart()
      var numberOfGames = Games.find({tournamentId: tournament}).count()
      numberOfGames.should.equal(0)
    })
  })
  describe('checkForRoundFinish', function() {
    it('should end the tournament if all games are over', function() {
      players = []
      for(var x = 0; x < 16; x++) {
        var player = Meteor.users.insert({})
        players.push(player)
      }
      var tournament = Tournaments.insert({
        startDate: moment().subtract(2, 'minutes').toDate(),
        endRegister: moment().subtract(1, 'minutes').toDate(),
        tournamentName: 'Weekly ManTracker.co Tournament',
        tournamentDescription: 'Fight to the death in our ManTracker hosted weekly tournament. Every week, players will fight to win by joining the weekly tournament and earning points when they win. Play now!',
        slots: 64,
        region: 'north-america',
        started: true,
        active: true,
        players: players,
        players_left: players,
        round: 1,
        winner: null
      })
      var gameId = Games.insert({
        tournamentId: tournament,
        players: players,
        round: 1,
        started: true,
        status: 'Active',
        active: false,
        eliminated: false,
        toJoin: moment().subtract(34, 'minutes').add(timeOffset, 'minutes').toDate(),
        gameEnd: moment().subtract(1, 'minutes').add(timeOffset, 'minutes').toDate()
      })
      Votes.insert({
        gameId: gameId,
        player: players[0]
      })
      checkForRoundFinish()
      var tournamentEnd = Tournaments.findOne({_id: tournament})
      expect(tournamentEnd.active).to.equal(false)
    })
    it('should set the winner of the tournament if all games are over and one winner remains', function() {
      players = []
      for(var x = 0; x < 16; x++) {
        var player = Meteor.users.insert({})
        players.push(player)
      }
      var tournament = Tournaments.insert({
        startDate: moment().subtract(2, 'minutes').toDate(),
        endRegister: moment().subtract(1, 'minutes').toDate(),
        tournamentName: 'Weekly ManTracker.co Tournament',
        tournamentDescription: 'Fight to the death in our ManTracker hosted weekly tournament. Every week, players will fight to win by joining the weekly tournament and earning points when they win. Play now!',
        slots: 64,
        region: 'north-america',
        started: true,
        active: true,
        players: players,
        players_left: players,
        round: 1,
        winner: null
      })
      var gameId = Games.insert({
        tournamentId: tournament,
        players: players,
        round: 1,
        started: true,
        status: 'Active',
        active: false,
        eliminated: false,
        toJoin: moment().subtract(34, 'minutes').add(timeOffset, 'minutes').toDate(),
        gameEnd: moment().subtract(1, 'minutes').add(timeOffset, 'minutes').toDate()
      })
      Votes.insert({
        gameId: gameId,
        player: players[0]
      })
      Votes.insert({
        gameId: gameId,
        player: players[0]
      })
      Votes.insert({
        gameId: gameId,
        player: players[1]
      })
      checkForRoundFinish()
      var winner = Tournaments.findOne({_id: tournament}).winner
      console.log(players)
      expect(winner).to.equal(players[0])
    })
    it('should not end the tournament if games are still left', function() {
      players = []
      for(var x = 0; x < 16; x++) {
        var player = Meteor.users.insert({})
        players.push(player)
      }
      var tournament = Tournaments.insert({
        startDate: moment().subtract(2, 'minutes').toDate(),
        endRegister: moment().subtract(1, 'minutes').toDate(),
        tournamentName: 'Weekly ManTracker.co Tournament',
        tournamentDescription: 'Fight to the death in our ManTracker hosted weekly tournament. Every week, players will fight to win by joining the weekly tournament and earning points when they win. Play now!',
        slots: 64,
        region: 'north-america',
        started: true,
        active: true,
        players: players,
        players_left: players,
        round: 1,
        winner: null
      })
      var gameId = Games.insert({
        tournamentId: tournament,
        players: players,
        round: 1,
        started: true,
        status: 'Active',
        active: false,
        eliminated: false,
        toJoin: moment().subtract(34, 'minutes').add(timeOffset, 'minutes').toDate(),
        gameEnd: moment().subtract(1, 'minutes').add(timeOffset, 'minutes').toDate()
      })
      Votes.insert({
        gameId: gameId,
        player: players[0]
      })
      Votes.insert({
        gameId: gameId,
        player: players[0]
      })
      Votes.insert({
        gameId: gameId,
        player: players[1]
      })
      var gameId2 = Games.insert({
        tournamentId: tournament,
        players: players,
        round: 1,
        started: true,
        status: 'Active',
        active: true,
        eliminated: false,
        toJoin: moment().subtract(34, 'minutes').add(timeOffset, 'minutes').toDate(),
        gameEnd: moment().subtract(1, 'minutes').add(timeOffset, 'minutes').toDate()
      })
      checkForRoundFinish()
      var tournamentEnd = Tournaments.findOne({_id: tournament})
      expect(tournamentEnd.active).to.equal(true)
    })
    afterEach(function() {
      StubCollections.restore()
    })
  })
})
