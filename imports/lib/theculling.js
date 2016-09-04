var fork = require('child_process').fork
var winston = require('winston')
var rp = require('request-promise')
var socketClient = require('socket.io-client')
var jar = rp.jar()
var greenworks

if(process.env.authTicket === undefined) {
  greenworks = fork(process.env.PWD +  __dirname + '/greenworks_communicator.js')
}

function getAuthSessionTicket() {
  return new Promise(function(resolve, reject) {
    if(process.env.authTicket) {
      winston.info('Using env variable to authenticate with steam...')
      resolve(process.env.authTicket)
    } else {
      greenworks.send('getAuthSessionTicket')
      greenworks.on('message', function(ticket) {
        resolve(ticket.ticket)
      })
    }
  })
}

API_SERVER = 'https://clientweb-us-east.theculling.net'

export class CullingAPI {
  constructor(api_server) {
    this.busy = true
    winston.log('info', 'Initializing Steamworks API...')
    if(process.env.authTicket === undefined) {
      greenworks.send('initAPI')
    }
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

      this.socket.on('connect', Meteor.bindEnvironment(() => {
        winston.log('info', 'Connected to matchmaking server.')
        this.socket.emit('login', status.sessionID)
      }))
      this.socket.on('auth-response', Meteor.bindEnvironment((status) => {
        winston.log('info', 'Login status: ' + status)
        resolve(this.socket)
      }))
    })
  }
  login() {
    var self = this
    return getAuthSessionTicket().then((ticket) => {
      return rp({
        method: 'POST',
        uri: API_SERVER + '/api/login',
        form: {
          authTicket: ticket,
          appid: 437220,
          build: '2016.08.23_93811_Full',
          rank: 551
        },
        jar: jar
      })
    }).then(this.loginSockets).then((socket) => {
      self.socket = socket
      this.busy = false
    })
  }
  launchGame(numPlayersBeforeStart, cb, timeout) {
    this.busy = true
    var calledBack = false

    numPlayers = 0
    var matchStarted = false

    this.socket.emit('lobby-leave') // make sure we aren't already in a lobby
    this.socket.emit('lobby-create')
    winston.info('Creating lobby... ' + timeout + 'numplayers: ' + numPlayersBeforeStart)
    this.socket.on('match-ready', Meteor.bindEnvironment((match) => {
      Meteor.setTimeout(function() {
        this.socket.emit('lobby-leave')
        this.busy = false
        winston.info('Leaving lobby...')
      }, 1000)
    }))

    var checkForGameStart = Meteor.setInterval(() => {
      if(new Date() > new Date(timeout)) {
        if(matchStarted === false) {
          if(numPlayers > 1) {
            this.socket.emit('lobby-start-match')
            matchStarted = true
            winston.info('Starting match...')
          } else {
            cb(null, {code: '', players: []})
          }
        }
      }
    }, 1000)

    this.socket.on('lobby-update', Meteor.bindEnvironment((lobbyStatus) => {
      if(typeof(lobbyStatus) === 'string') {
        lobbyStatus = JSON.parse(lobbyStatus)
      }
      winston.info(lobbyStatus)
      if(!calledBack) {
        cb(null, {code: lobbyStatus.code, players: lobbyStatus.members})
      }
      numPlayers = lobbyStatus.members.length
      if(numPlayers === numPlayersBeforeStart + 1 && matchStarted === false) {
        this.socket.emit('lobby-start-match')
        matchStarted = true
        winston.info('Starting match...')
      }
    }))
  }
}

export var TheCullingUS = new CullingAPI()
