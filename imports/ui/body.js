import { Template } from 'meteor/templating'

import './body.html'

Template.body.events({
  'click #login-button': function() {
    Meteor.loginWithSteam()
  }
})
