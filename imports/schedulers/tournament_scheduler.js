import { Tournaments } from '../api/tournaments'
import moment from 'moment'

var scheduleTournaments = function() {
  count = Tournaments.find({active: true}).count()
  if(count == 0) {
    // schedule an upcoming tournament
    Tournaments.insert({
      startDate: moment().add(2, 'minutes').toDate(),
      endRegister: moment().add(1, 'minutes').toDate(),
      tournamentName: 'Weekly ManTracker.co Tournament',
      tournamentDescription: 'Fight to the death in our ManTracker hosted weekly tournament. Every week, players will fight to win by joining the weekly tournament and earning points when they win. Play now!',
      slots: 64,
      region: 'north-america',
      started: false,
      active: true,
      players: []
    })
  }
}

SyncedCron.add({
  name: 'Schedule tournaments',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 2 seconds')
  },
  job: scheduleTournaments
})

// call it once for the first time
scheduleTournaments()
