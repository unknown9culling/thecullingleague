import { Tournaments } from '../api/tournaments'
import moment from 'moment-timezone'

var scheduleTournaments = function() {
  countNA = Tournaments.find({active: true, region: 'north-america'}).count()
  if(countNA == 0) {
    // schedule an upcoming tournament
    Tournaments.insert({
      startDate: moment().tz('America/Los_Angeles').day(6).hour(12).minute(1).second(0).toDate(),
      endRegister: moment().tz('America/Los_Angeles').day(6).hour(12).minute(0).second(0).toDate(),
      tournamentName: 'Weekly ManTracker.co Tournament',
      tournamentDescription: 'Fight to the death in our ManTracker hosted weekly tournament. Every week, players will fight to win by joining the weekly tournament and earning points when they win. Play now!',
      slots: 64,
      region: 'north-america',
      started: false,
      active: true,
      players: [],
      players_left: [],
      round: 1,
      winner: null
    })
  }
  countEU = Tournaments.find({active: true, region: 'europe'}).count()
  if(countEU == 0) {
    // schedule an upcoming tournament
    Tournaments.insert({
      startDate: moment().tz('Europe/Berlin').day(6).hour(12).minute(1).second(0).toDate(),
      endRegister: moment().tz('Europe/Berlin').day(6).hour(12).minute(0).second(0).toDate(),
      tournamentName: 'Weekly ManTracker.co Tournament',
      tournamentDescription: 'Fight to the death in our ManTracker hosted weekly tournament. Every week, players will fight to win by joining the weekly tournament and earning points when they win. Play now!',
      slots: 64,
      region: 'europe',
      started: false,
      active: true,
      players: [],
      players_left: [],
      round: 1,
      winner: null
    })
  }
  countOCN = Tournaments.find({active: true, region: 'oceania'}).count()
  if(countOCN == 0) {
    // schedule an upcoming tournament
    Tournaments.insert({
      startDate: moment().tz('Australia/Sydney').day(6).hour(12).minute(1).second(0).toDate(),
      endRegister: moment().tz('Australia/Sydney').day(6).hour(12).minute(0).second(0).toDate(),
      tournamentName: 'Weekly ManTracker.co Tournament',
      tournamentDescription: 'Fight to the death in our ManTracker hosted weekly tournament. Every week, players will fight to win by joining the weekly tournament and earning points when they win. Play now!',
      slots: 64,
      region: 'oceania',
      started: false,
      active: true,
      players: [],
      players_left: [],
      round: 1,
      winner: null
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
