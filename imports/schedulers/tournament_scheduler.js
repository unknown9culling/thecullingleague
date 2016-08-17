import { Tournaments } from '../api/tournaments'
import moment from 'moment'

var scheduleTournaments = function() {
  count = Tournaments.find({active: true}).count()
  if(count == 0) {
    // schedule an upcoming tournament
    Tournaments.insert({
      startDate: moment().add(7, 'days').toDate(),
      endRegister: moment().add(6, 'days').toDate(),
      tournamentName: 'Weekly ManTracker.co Tournament',
      tournamentDescription: 'Fight to the death in our ManTracker hosted weekly tournament. Every week, players will fight to win by joining the weekly tournament and earning points when they win. Play now!',
      slots: 16,
      region: 'north-america',
      active: true
    })
  }
}

SyncedCron.add({
  name: 'Schedule tournaments',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 30 seconds')
  },
  job: scheduleTournaments
})

// call it once for the first time
scheduleTournaments()
