var fork = require('child_process').fork
var winston = require('winston')
var rp = require('request-promise')
var socketClient = require('socket.io-client')
var jar = rp.jar()

var greenworks = fork(process.env.PWD +  __dirname + '/greenworks_communicator.js')

function getAuthSessionTicket() {
  return new Promise(function(resolve, reject) {
    greenworks.send('getAuthSessionTicket')
    greenworks.on('message', function(ticket) {
      resolve(ticket)
    })
    setTimeout(function() {
      reject()
    }, 5000)
  })
}

API_SERVER = 'https://clientweb-us-east.theculling.net'

export class CullingAPI {
  constructor(api_server) {
    this.busy = false
    winston.log('info', 'Initializing Steamworks API...')

    greenworks.send('initAPI')
  }
  login() {
    var self = this
    return getAuthSessionTicket().then(function(auth_session) {
      let ticket = auth_session.ticket
      return rp({
        method: 'POST',
        uri: API_SERVER + '/api/login',
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
      uri: API_SERVER + '/api',
      jar: jar
    })
  }
  loginSockets(status) {
    return new Promise(function(resolve, reject) {
      if(typeof(status) === 'string') {
        status = JSON.parse(status)
      }
      var socket = socketClient.connect(API_SERVER)

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
  launchGame(numPlayers, cb) {
    var self = this
    this.busy = true
    var calledBack = false

    socket.emit('lobby-leave') // make sure we aren't already in a lobby
    socket.emit('lobby-create')
    socket.on('match-ready', function() {
      socket.emit('lobby-leave')
      self.busy = false
    })

    setTimeout(function() {
      self.busy = false
      calledBack = true
      cb('Couldn\'t create lobby!')
    }, 10000)

    socket.on('lobby-update', function(lobbyStatus) {
      if(typeof(lobbyStatus) === 'string') {
        lobbyStatus = JSON.parse(lobbyStatus)
      }
      if(!calledBack) {
        cb(null, lobbyStatus.code)
      }
      if(lobbyStatus.members.length === numPlayers + 1) {
        socket.emit('lobby-start-match')
      }
    })
  }
}
