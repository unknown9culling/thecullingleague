var greenworks = require('./greenworks');
var winston = require('winston');
var rp = require('request-promise');
var socketClient = require('socket.io-client');
var jar = rp.jar()

var SERVER = 'https://clientweb-us-east.theculling.net'
var API_LOCATION = SERVER + '/api'

winston.log('info', 'Initializing Steamworks API...')

greenworks.initAPI();

function getAuthSessionTicket() {
  return new Promise(function(resolve, reject) {
    greenworks.getAuthSessionTicket(resolve);
  })
}

function getAPIStatus() {
  return rp({
    uri: API_LOCATION,
    jar: jar
  })
}

function loginToAPI() {
  return getAuthSessionTicket().then(function(auth_session) {
    ticket = auth_session.ticket
    return rp({
      method: 'POST',
      uri: API_LOCATION + '/login',
      form: {
        authTicket: ticket,
        appid: 437220,
        build: '2016.08.08_93315_Full',
        rank: 551
      },
      jar: jar
    })
  })
}

function handleLogin() {
  return getAPIStatus().then(function(status) {
    if(typeof(status) === 'string') {
      status = JSON.parse(status)
    }
    if(status.authenticated === false) {
      winston.log('info', 'Not authenticated... logging in!')
      return loginToAPI()
    } else {
      winston.log('info', 'Authenticated! Starting socket!')
      return status;
    }
  });
}

function handleSockets(status) {
  return new Promise(function(resolve, reject) {
    if(typeof(status) === 'string') {
      status = JSON.parse(status)
    }
    var socket = socketClient.connect(SERVER)

    socket.on('connect', function() {
      winston.log('info', 'Connected to matchmaking server.')
      socket.emit('login', status.sessionID)
    })
    socket.on('auth-response', function(status) {
      winston.log('info', 'Login status: ' + status)
      resolve(socket)
    })
  });
}

handleLogin()
  .then(handleSockets)
  .then(function(socket) {
    winston.log('info', 'Creating lobby...')
    socket.on('lobby-update', function(lobbyStatus) {
      console.log(lobbyStatus)
      if(typeof(lobbyStatus) === 'string') {
        lobbyStatus = JSON.parse(lobbyStatus)
      }
      if(lobbyStatus.members.length > 1) {
        socket.emit("lobby-start-match");
      }
    })
    socket.on('match-ready', function(matchStatus) {
      console.log(matchStatus)
    })
    socket.emit("lobby-create")
    // socket.emit("lobby-get")

  })
