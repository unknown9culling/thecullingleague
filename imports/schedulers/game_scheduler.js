import { Games } from '../api/games'
import { Tournaments } from '../api/tournaments'

import { getGames } from '../util/get_games'
import moment from 'moment'

var tournamentStart = function(tournament) {
  // games.forEach((game) => {
  //   Games.insert({
  //     tournamentId: tournament._id,
  //     players: tournament.players,
  //
  //   })
  // })
}

var checkForTournamentStart = function() {
  var activeTournaments = Tournaments.find({active: true})

  activeTournaments.forEach(function(tournament) {
    if(new Date() > new Date(tournament.endRegister)) {
      tournamentStart(tournament)
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

// call it once for the first time
checkForTournamentStart()
