var greenworks = require('./greenworks')

require('fs').writeFileSync('steam_appid.txt', '437220')
greenworks.initAPI()
setTimeout(greenworks.getAuthSessionTicket(function(ticket) {
  console.log(ticket)
}), 1000)
