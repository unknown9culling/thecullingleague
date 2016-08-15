import '../imports/api/game'
import '../imports/api/tournaments'
import '../imports/accounts/accounts'

import { Meteor } from 'meteor/meteor'
import { ServiceConfiguration } from 'meteor/service-configuration'
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
