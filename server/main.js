import { Meteor } from 'meteor/meteor'
import { ServiceConfiguration } from 'meteor/service-configuration'
import { TheCullingUS, TheCullingEU, TheCullingOCN } from '../imports/lib/theculling'

import '../imports/api/games'
import '../imports/api/tournaments'
import '../imports/api/votes'

import '../imports/accounts/accounts'

SyncedCron.config({
  log: false
})

import '../imports/schedulers/tournament_scheduler'
import '../imports/schedulers/game_scheduler'
Meteor.setTimeout(() => {
  TheCullingUS.login()
  Meteor.setTimeout(() => {TheCullingEU.login()}, 2000)
  Meteor.setTimeout(() => {TheCullingOCN.login()}, 4000)

  SyncedCron.start()

  Meteor.startup(function () {
    ServiceConfiguration.configurations.upsert(
      { service: 'steam' },
      {
        $set: {
          loginStyle: 'redirect',
          timeout: 10000 // 10 seconds
        }
      }
    )
  })
}, 5000)
