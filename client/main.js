import '../imports/ui/header.html'
import '../imports/ui/footer.html'
import '../imports/ui/layout.html'
import '../imports/ui/index.html'
import '../imports/ui/faq.html'
import '../imports/ui/about.html'
import { Router } from 'meteor/iron:router'
import { Template } from 'meteor/templating'
import { Meteor } from 'meteor/meteor'

Router.configure({
  layoutTemplate: 'layout'
})

Router.route('/', function () {
  this.render('index')
})

Router.route('/faq', function () {
  this.render('faq')
})

Router.route('/about', function () {
  this.render('about')
})

Template.header.events({
  'click #login-button': function() {
    Meteor.loginWithSteam()
  }
})

Template.index.events({
  'click #login-button': function() {
    Meteor.loginWithSteam()
  }
})
