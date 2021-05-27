// Based on socket.io
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server, {})

// Start a simple local server and return index.html
app.get('/', (req, res) => {
  res.sendfile(__dirname + '/index.html')
})

// Monitor 6788
server.listen(6788, () => {
  console.log(`server runing on port 6788 ...`)
})

// The server listens to all clients and returns the new connection object
// When each client socket connects, the connection event is triggered
let num = 0
io.on('connection', (socket) => {

  socket.on('disconnect', (reason) => {
    console.log('Disconnect')
  })
  socket.on('error', (error) => {
    console.log('An error occurred')
  })
  socket.on('disconnecting', (reason) => {
    console.log('The client disconnected but has not left yet')
  })

  console.log(socket.id) // Get the id of the client that is currently connected
  io.clients((error, ids) => {
    console.log(ids)  // Get the IDs of all connected clients
  })

  //Listen to events sent by the client
  socket.on('feEve', (data) => {
    console.log('feEve', data)
  })
  //Send events to the client
  setInterval(() => {
    socket.emit('serverEve', ++num)
  }, 1000)
})
// io.close()  // Close all connections




// Based on ws
/*
const fs = require('fs')
const express = require('express')
const app = express()

// Start a simple local server and return index.html
const httpServer = app.get('/', (req, res) => {
  res.writeHead(200)
  fs.createReadStream('./index.html').pipe(res)
}).listen(6788, () => {
  console.log(`server runing on port 6788 ...`)
})

// ws
const WebSocketServer = require('ws').Server
const wssOptions = {
  server: httpServer,
  // port: 6789,
  // path: '/test'
}
const wss = new WebSocketServer(wssOptions, () => {
  console.log(`server runing on port ws 6789 ...`)
})

let num = 1
wss.on('connection', (wsocket) => {
  console.log('connection succeeded')

  wsocket.on('message', (message) => {
    console.log('Received the news', message)
  })
  wsocket.on('close', (message) => {
    console.log('Disconnected')
  })
  wsocket.on('error', (message) => {
    console.log('An error occurred')
  })
  wsocket.on('open', (message) => {
    console.log('establish connection')
  })

  setInterval(() => {
    wsocket.send( ++num )
  }, 1000)
})
*/