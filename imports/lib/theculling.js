var greenworks = require('./greenworks')
var winston = require('winston')
var rp = require('request-promise')
var socketClient = require('socket.io-client')
var jar = rp.jar()

function getAuthSessionTicket() {
  return new Promise(function(resolve, reject) {
    greenworks.getAuthSessionTicket(resolve)
  })
}

export class CullingAPI {
  constructor(api_server) {
    if(api_server === undefined) {
      api_server = 'https://clientweb-us-east.theculling.net'
    }
    this.api_server = api_server
    winston.log('info', 'Initializing Steamworks API...')

    greenworks.initAPI()
  }
  login() {
    return getAuthSessionTicket().then(function(auth_session) {
      let ticket = auth_session.ticket
      return rp({
        method: 'POST',
        uri: this.api_server + '/api/login',
        form: {
          authTicket: ticket,
          appid: 437220,
          build: '2016.08.08_93315_Full',
          rank: 551
        },
        jar: jar
      })
    }).then(this.loginSockets)
  }
  getStatus() {
    return rp({
      uri: this.api_server + '/api',
      jar: jar
    })
  }
  loginSockets(status) {
    return new Promise(function(resolve, reject) {
      if(typeof(status) === 'string') {
        status = JSON.parse(status)
      }
      var socket = socketClient.connect(this.api_server)

      socket.on('connect', function() {
        winston.log('info', 'Connected to matchmaking server.')
        socket.emit('login', status.sessionID)
      })
      socket.on('auth-response', function(status) {
        winston.log('info', 'Login status: ' + status)
        resolve(socket)
      })
    })
  }
}
