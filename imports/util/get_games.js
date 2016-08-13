export function get_games(players, game_size) {
  if(players.length < 16) {
    return [players]
  } else {
    min_games = Math.ceil(players.length / game_size)

    games = []
    for(var x = 0; x < min_games; x++) {
      games.push([])
    }

    index = 0
    players.forEach((player) => {
      games[index % min_games].push(player)
      index++
    })

    return games
  }
}
