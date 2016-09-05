var fork = require('child_process').fork
var winston = require('winston')
var rp = require('request-promise')
var request = require('request')
var socketClient = require('socket.io-client')
var jar = rp.jar()
var greenworks
var authTicket

if(process.env.authTicket === undefined) {
  greenworks = fork(process.env.PWD +  __dirname + '/greenworks_communicator.js')
  greenworks.send('initAPI')
  greenworks.send('getAuthSessionTicket')
  greenworks.on('message', function(ticket) {
    authTicket = ticket.ticket
  })
} else {
  authTicket = process.env.authTicket
}

export class CullingAPI {
  constructor(api_server) {
    this.busy = true
    this.apiServer = api_server
    winston.log('info', this.apiServer + ': Initializing Steamworks API...')
    this.cookie_jar = rp.jar()
  }
  getStatus() {
    return rp({
      uri: this.apiServer + '/api',
      jar: this.cookie_jar
    })
  }
  login() {
    var self = this
    rp({
      method: 'POST',
      uri: self.apiServer + '/api/login',
      form: {
        authTicket: authTicket,
        appid: 437220,
        build: '2016.08.23_93811_Full',
        rank: 551
      },
      jar: jar
    }).then(function(status) {
      return new Promise((resolve, reject) => {
        if(typeof(status) === 'string') {
          status = JSON.parse(status)
        }
        this.socket = socketClient.connect(self.apiServer)

        this.socket.on('connect', () => {
          winston.log('info', self.apiServer + ': Connected to matchmaking server.')
          this.socket.emit('login', status.sessionID)
        })
        this.socket.on('auth-response', (status) => {
          winston.log('info', self.apiServer + ': Login status: ' + status)
          resolve(this.socket)
        })
      })
    }).then((socket) => {
      self.socket = socket
      self.busy = false
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

export var TheCullingUS = new CullingAPI('https://clientweb-us-east.theculling.net')
export var TheCullingEU = new CullingAPI('https://clientweb-eu.theculling.net')
export var TheCullingOCN = new CullingAPI('https://clientweb-ocn.theculling.net')
