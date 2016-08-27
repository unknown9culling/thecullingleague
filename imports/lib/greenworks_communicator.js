var greenworks = require('./greenworks')

require('fs').writeFileSync('steam_appid.txt', '437220')

process.on('message', function(message) {
  if(message === 'initAPI') {
    greenworks.initAPI()
  }
  if(message === 'getAuthSessionTicket') {
    greenworks.getAuthSessionTicket(function(ticket) {
      process.send(ticket)
    })
  }
})
