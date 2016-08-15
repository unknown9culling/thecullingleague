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
