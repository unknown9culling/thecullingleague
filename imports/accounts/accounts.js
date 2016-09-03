import { Accounts } from 'meteor/accounts-base'
import { HTTP } from 'meteor/http'

Accounts.onCreateUser(function(options, user) {
  var steamId = user.services.steam.id
  var response = HTTP.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=29C1ABCF682442DDCD8207890A2D658D&steamids=' + steamId)
  user.profile = response.data.response.players[0]
  return user
})

Meteor.publish(null, function() {
  return Meteor.users.find({})
})

Meteor.methods({
  'users.setRegion'(region) {
    check(region, String)
    Meteor.users.update({_id: this.userId}, {$set: {region: region}})
  }
})
