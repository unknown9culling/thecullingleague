import { Accounts } from 'meteor/accounts-base'

Accounts.onCreateUser(function(options, user) {
  console.log('a', user)
})

Accounts.validateLoginAttempt(function(info) {
  console.log('b', info)
})
