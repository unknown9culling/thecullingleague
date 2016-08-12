var express = require('express');
var fs = require('fs');

var privateKey = fs.readFileSync('server.key');
var certificate = fs.readFileSync('server.cert');

var app = express();
var server = require('https').createServer({
    key: privateKey,
    cert: certificate
}, app)
var serverHTTP = require('http').createServer(app)

var io = require('socket.io')(serverHTTP);
var port = process.env.PORT || 443;
var morgan = require('morgan')
authenticated = true

app.use(morgan("combined"))

app.get('/api', function(req, res) {
  res.json({
    "authenticated": authenticated,
    "login": "https://clientweb-us-east.theculling.net/api/login",
    "news": "https://clientweb-us-east.theculling.net/api/news",
    "redeemSystemOnline": true,
    "status": "https://clientweb-us-east.theculling.net/api/status"
  })
})

app.post('/api/login', function(req, res) {
  authenticated = true
  res.json({
    "redirect": "https://clientweb-us-east.theculling.net/api/",
    "sessionID": "6UO6HjbD2y1o7LxDEP0rab5fqsYKs8Jd"
  })
})

server.listen(443, function(){
  console.log('listening on *:443');
});
serverHTTP.listen(80, function() {
  console.log('listening on *:80')
})

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  console.log("connected!")
});
