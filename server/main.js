import { Meteor } from 'meteor/meteor'
import { ServiceConfiguration } from 'meteor/service-configuration'
import { CullingAPI } from '../imports/lib/theculling'

TheCullingUS = new CullingAPI()

import '../imports/api/games'
import '../imports/api/tournaments'
import '../imports/accounts/accounts'

SyncedCron.config({
  log: false
})

import '../imports/schedulers/tournament_scheduler'
import '../imports/schedulers/game_scheduler'

TheCullingUS.login()

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
