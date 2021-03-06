export function getGames(players, game_size) {
  if(players.length <= game_size) {
    return [players]
  } else {
    var min_games = Math.ceil(players.length / game_size)

    var games = []
    for(var x = 0; x < min_games; x++) {
      games.push([])
    }

    var index = 0
    players.forEach((player) => {
      games[index % min_games].push(player)
      index++
    })

    return games
  }
}
