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
    this.busy = true
    winston.log('info', 'Initializing Steamworks API...')

    greenworks.send('initAPI')
  }
  login() {
    var self = this
    return getAuthSessionTicket().then((auth_session) => {
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
    }).then(this.loginSockets).then((socket) => {
      self.socket = socket
      this.busy = false
    })
  }
  getStatus() {
    return rp({
      uri: API_SERVER + '/api',
      jar: jar
    })
  }
  loginSockets(status) {
    return new Promise((resolve, reject) => {
      if(typeof(status) === 'string') {
        status = JSON.parse(status)
      }
      this.socket = socketClient.connect(API_SERVER)

      this.socket.on('connect', () => {
        winston.log('info', 'Connected to matchmaking server.')
        this.socket.emit('login', status.sessionID)
      })
      this.socket.on('auth-response', (status) => {
        winston.log('info', 'Login status: ' + status)
        resolve(this.socket)
      })
    })
  }
  launchGame(numPlayers, cb) {
    this.busy = true
    var calledBack = false

    this.socket.emit('lobby-leave') // make sure we aren't already in a lobby
    this.socket.emit('lobby-create')
    this.socket.on('match-ready', () => {
      this.socket.emit('lobby-leave')
      this.busy = false
    })

    setTimeout(() => {
      this.busy = false
    }, 10000)

    this.socket.on('lobby-update', (lobbyStatus) => {
      if(typeof(lobbyStatus) === 'string') {
        lobbyStatus = JSON.parse(lobbyStatus)
      }
      if(!calledBack) {
        cb(null, lobbyStatus.code)
      }
      if(lobbyStatus.members.length === numPlayers + 1) {
        this.socket.emit('lobby-start-match')
      }
    })
  }
}

export var TheCullingUS = new CullingAPI()
