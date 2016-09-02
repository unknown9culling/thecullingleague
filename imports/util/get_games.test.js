import { getGames } from './get_games'

describe('get_games function', function() {
  it('should return an equal number of players per game if given an even amount above the maximum amount', function() {
    chai.should()

    var games = getGames([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)
    games[0].should.have.length(games[1].length)
  })
  it('should return the array if number of players is equal to the maximum number of players', function() {
    chai.should()

    var games = getGames([1, 2, 3, 4, 5], 5)

    games.should.have.length(1)
  })
  it('should form 3 games if given 1 less than 3 times the maximum players in a game', function() {
    chai.should()

    var games = getGames([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 5)

    games.should.have.length(3)
  })
})
