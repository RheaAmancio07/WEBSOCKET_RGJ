Original short book: https://www.jianshu.com/p/958eba34a5da

There may be many students who use setInterval to control the experience of Ajax continuously requesting the latest data from the server (polling). Look at the following code:
```
setInterval(function() {
    $.get('/get/data-list', function(data, status) {
        console.log(data)
    })
}, 5000)
```
In this way, the front end will request data from the backend every 5 seconds. The implementation seems very simple, but there is a very important problem, that is, we can’t control the stability of the network speed and cannot guarantee the next time the request is sent. The result of one request has been successfully returned, so there is bound to be hidden dangers. Smart students will immediately think of using setTimeout with recursion to look at the following code:
```
function poll() {
    setTimeout(function() {
        $.get('/get/data-list', function(data, status) {
            console.log(data)
            poll()
        })
    }, 5000)
}
```
After the result is returned, the next request is delayed. Although there is no way to ensure that the interval between the two requests is exactly the same, it can at least ensure that the rhythm of the data return is stable. It seems that the demand has been fulfilled but so If we don’t care about its performance, the code structure is not elegant. In order to solve this problem, the server can stay connected with the client for a long time for data communication. 5 Added WebSocket and EventSource for To achieve long polling, let's analyze the characteristics and usage scenarios of the two.


## WebSocket

**What:** WebSocket is a means of communication, based on the TCP protocol, the default port is also 80 and 443, the protocol identifier is ws (encrypted as wss), it realizes the full duplex communication between the browser and the server, expansion In addition, the communication function between the browser and the server allows the server to actively send data to the client without cross-domain restrictions.

** What's the use: ** WebSocket is used to solve the problem that http cannot be connected permanently. Because it can communicate in both directions, it can be used to realize chat rooms and other functions actively pushed by the server, such as real-time weather, stock quotes, Remaining ticket display, message notification, etc.


## EventSource

**What is:** The official name of EventSource should be Server-sent events (abbreviated as SSE). EventSource is a simple single communication based on the http protocol, which realizes the process of server push. Clients cannot provide services through EventSource. Send data at the end. I like to hear that IE is not compatible. Of course, there are solutions such as `npm install event-source-polyfill`. Although it cannot achieve two-way communication, it also has some advantages in functional design, such as automatic reconnection, event IDs, and the ability to send random events (WebSocket can be reconnected with the help of third-party libraries such as socket.io.)

**What's the use:** Because of the limitation of single communication, EventSource can only be used to implement scenarios such as stock quotes, news feeds, and real-time weather, which only require the server to send messages to the client. EventSource is more convenient to use, which is also his advantage.


## The difference between WebSocket & EventSource
1. WebSocket is based on TCP protocol, and EventSource is based on http protocol.
2. EventSource is one-way communication, while websocket is two-way communication.
3. EventSource can only send text, while websocket supports sending binary data.
4. EventSource is simpler than websocket in implementation.
5. EventSource has the ability to automatically reconnect (without the aid of a third party) and send random events.
6. Websocket's resource occupies too much. EventSource is lighter.
7. Websocket can be cross-domain, EventSource requires the server to set the request header based on http cross-domain.

## EventSource的实现案例

Client code
```
// The instantiated EventSource parameter is the route monitored by the server
var source = new EventSource('/EventSource-test')
source.onopen = function (event) {// Call back for successful connection with the server
  console.log('Successfully connected to the server')
}
// Listen to all messages sent from the server without a specified event type (messages without event field)
source.onmessage = function (event) {// listen for unnamed events
  console.log('Unnamed event', event.data)
}
source.onerror = function (error) {// monitor error
  console.log('error')
}
// Listen to the specified type of event (multiple can be monitored)
source.addEventListener("myEve", function (event) {
  console.log("myEve", event.data)
})
```
Server code (node.js)
```
const fs = require('fs')
const express = require('express') // npm install express
const app = express()

// Start a simple local server and return index.html
app.get('/', (req, res) => {
  fs.stat('./index.html', (err, stats) => {
    if (!err && stats.isFile()) {
      res.writeHead(200)
      fs.createReadStream('./index.html').pipe(res)
    } else {
      res.writeHead(404)
      res.end('404 Not Found')
    }
  })
})

// Monitor EventSource-test routing server to return event stream
app.get('/EventSource-test', (ewq, res) => {
  // Set the header according to the EventSource specification
  res.writeHead(200, {
    "Content-Type": "text/event-stream", // specifies that the header is set to text/event-stream
    "Cache-Control": "no-cache" // Set not to cache the page
  })
  // Use write to return the event stream. The event stream is just a simple text data stream. Each message is divided by a blank line (\n).
  res.write(':comment' +'\n\n') // comment line
  res.write('data:' +'message content 1'+'\n\n') // unnamed event

  res.write( // named event
    'event: myEve' +'\n' +
    'data:' +'Message content 2'+'\n' +
    'retry:' + '2000' +'\n' +
    'id:' + '12345' +'\n\n'
  )

  setInterval(() => {// Timing event
    res.write('data:' +'timing message' +'\n\n')
  }, 2000)
})

// monitor 6788
app.listen(6788, () => {
  console.log(`server runing on port 6788 ...`)
})
```

Client access to `http://127.0.0.1:6788/` will see the following output:
![](https://upload-images.jianshu.io/upload_images/13130832-3dca9575eb6bcba4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

To summarize the related apis, the client api is very simple and all are in the comments, and the server has some points to pay attention to:
#### Event stream format?
The event stream is just a simple text data stream, and the text should be encoded in UTF-8 format. Each message is followed by a blank line as a separator. Line comment lines beginning with a colon will be ignored.
#### What is the use of comments?
The comment line can be used to prevent connection timeout, and the server can periodically send a message comment line to keep the connection constant.
#### Which fields are specified in the EventSource specification?
`event:` Event type. If this field is specified, when the client receives the message, an event will be triggered on the current EventSource object. The event type is the field value of the field. You can use addEventListener() The method listens to any type of named event on the current EventSource object. If the message has no event field, it will trigger the event handler on the onmessage property.
`data:` The data field of the message. If the message contains multiple data fields, the client will use line breaks to concatenate them into a string as the field value.
`id:` Event ID, which will become the property value of the internal property "Last Event ID" of the current EventSource object.
`retry:` An integer value that specifies the reconnection time (in milliseconds). If the field value is not an integer, it will be ignored.
#### What does Reconnect do?
As mentioned above, the retry field is used to specify the reconnection time, so why do you want to reconnect? Let’s take the node as an example. Everyone knows that the node is characterized by single-threaded asynchronous io, and single-threaded means that if the server side If an error is reported, the service will stop. Of course, these exceptions will be handled during the node development process, but once the service is stopped, you need to use tools such as pm2 to restart the operation. It's normal, but the client's EventSource link is still disconnected. At this time, reconnection is used.
#### Why does the message in the case end with \n?
\n is the escape character for newline. The EventSource specification stipulates that each message is followed by a blank line as a separator. Adding a \n at the end indicates the end of a field, and adding two \n indicates the end of a message. (Two \n means that a blank line is added after the line break)

*Note: If a line of text does not contain a colon, the entire line of text will be parsed into a field name, and the field value will be empty. *

<br/><br/>
## WebSocket implementation case

#### WebSocket client native api
`var ws = new WebSocket('ws://localhost:8080')`
The WebSocket object is used as a constructor to create a new WebSocket instance.

`ws.onopen = function(){}`
Used to specify the callback function after a successful connection.

`ws.onclose = function(){}`
Used to specify the callback function after the connection is closed

`ws.onmessage = function(){}`
Used to specify the callback function after receiving server data

`ws.send('data')`
The send() method of the instance object is used to send data to the server

`socket.onerror = function(){}`
Used to specify the callback function when an error is reported


#### How to implement WebSocket on the server side
There are many packages on npm that implement websocket, such as socket.io, WebSocket-Node, ws, and many more. This article only briefly analyzes socket.io and ws. For details, please check the official documentation.

#### What is the difference between socket.io and ws
`Socket.io:` Socket.io is a WebSocket library, including client-side js and server-side nodejs. It will automatically select the best from various methods such as WebSocket, AJAX long polling, Iframe streaming, etc. according to the browser Ways to realize real-time network applications (if WebSocket is not supported, it will be downgraded to AJAX polling), which is very convenient and user-friendly, with very good compatibility, and the minimum supported browser is IE5.5. Shielding the differences in details and compatibility issues, enabling cross-browser/cross-device bidirectional data communication.

`ws:` Unlike the socket.io module, ws is a pure websocket module, which does not provide upward compatibility and does not require additional js files on the client side. The client does not need to use the secondary encapsulated API to use the browser's native Websocket API to communicate.


#### Realize WebSocket two-way communication based on socket.io
Client code
```
<button id="closeSocket">Disconnect</button>
<button id="openSocket">Resume connection</button>
<script src="/socket.io/socket.io.js"></script>
<script>
// Establish a connection and point to window.location by default
let socket = io('http://127.0.0.1:6788')

openSocket.onclick = () => {
  socket.open() // Manually open the socket and you can also reconnect
}
closeSocket.onclick = () => {
  socket.close() // Manually close the client-to-server connection
}

socket.on('connect', () => {// successfully connected
  // socket.id is a unique identifier, which is set after the client connects to the server.
  console.log(socket.id)
})

socket.on('connect_error', (error) => {
  console.log('Connection error')
})
socket.on('disconnect', (timeout) => {
  console.log('Disconnect')
})
socket.on('reconnect', (timeout) => {
  console.log('Successfully reconnected')
})
socket.on('reconnecting', (timeout) => {
  console.log('Start to reconnect')
})
socket.on('reconnect_error', (timeout) => {
  console.log('Reconnect error')
})

// Monitor server return event
socket.on('serverEve', (data) => {
  console.log('serverEve', data)
})

let num = 0
setInterval(() => {
  // Send events to the server
  socket.emit('feEve', ++num)
}, 1000)

```

Server code (node.js)
```
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server, {})

// Start a simple local server and return index.html
app.get('/', (req, res) => {
  res.sendfile(__dirname +'/index.html')
})

// monitor 6788
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
    console.log(ids) // Get the IDs of all connected clients
  })

  // listen to events sent by the client
  socket.on('feEve', (data) => {
    console.log('feEve', data)
  })
  // Send events to the client
  setInterval(() => {
    socket.emit('serverEve', ++num)
  }, 1000)
})
/*
 io.close() // close all connections
*/
```
`const io = require('socket.io')(server, {})` The second parameter is a configuration item, you can pass in the following parameters:

-path:'/socket.io' the name of the capture path
-serveClient: false Whether to provide client files
-pingInterval: 10000 Time interval for sending messages
-pingTimeout: 5000 No data transmission connection is disconnected at this time
-origins:'*' allows cross-domain
-...
In the above implementation based on socket.io, `express` is used as a dependent service foundation for socket communication
`socket.io` as a socket communication module realizes two-way data transmission. Finally, it should be noted that on the server side `emit` distinguishes the following three cases:

-`socket.emit()`: send to the client that established the connection
-`socket.broadcast.emit()`: send to all clients except the client that established the connection
-`io.sockets.emit()`: send to all clients equal to the sum of the above two

#### Realize WebSocket two-way communication based on ws
Client code
```
let num = 0
let ws = new WebSocket('ws://127.0.0.1:6788')
ws.onopen = (evt) => {
  console.log('Connected successfully')
  setInterval(() => {
    ws.send(++ num) // send data to the server
  }, 1000)
}
ws.onmessage = (evt) => {
  console.log('Received server data', evt.data)
}
ws.onclose = (evt) => {
  console.log('Close')
}
ws.onerror = (evt) => {
  console.log('error')
}
closeSocket.onclick = () => {
  ws.close()  // Disconnect
}
```
Server code (node.js)
```
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
```

###### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;In the above code, `server: httpServer` is passed in when `new WebSocketServer`. The purpose is to unify the port, although WebSocketServer can use other However, the unified port is still a better choice. In fact, express does not directly occupy port 6788 but express calls the built-in http module to create http.Server listens to 6788. Express just registers the response function to the http.Server. Similarly, WebSocketServer can also register its own response function in http.Server, so that the same port can be handled by express and ws respectively according to the protocol. We get the reference of http.Server created by express, and configure it in wssOptions.server to start WebSocketServer according to the http service we passed in, thus achieving the purpose of unifying the port.

###### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Always note that when the browser creates a WebSocket, it still sends a standard HTTP request. Whether it is a WebSocket request or an ordinary HTTP request, it will be processed by http.Server. The specific processing method is implemented by the callback function injected by express and WebSocketServer. WebSocketServer will first determine whether the request is a WS request, if it is, it will process the request, if not, the request will still be processed by express. Therefore, the WS request will be processed directly by the WebSocketServer, and it will not go through express at all.

<br/>

*Some concepts are referenced from https://www.w3cschool.cn/socket/*