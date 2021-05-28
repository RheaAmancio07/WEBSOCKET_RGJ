const fs = require('fs')
const path = require('path')
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server, {})

const port = process.env.port || 5000;

// Read emoticons and avatars and send them to the front end
let portrait = fs.readdirSync('./file/portrait')
portrait = portrait.map(item => `/file/portrait/${item}`)
let emoticon = fs.readdirSync('./file/emoticon')
emoticon = emoticon.map(item => `/file/emoticon/${item}`)
emoticon = emoticon.filter((item, index) => {
  const TYPE = { gif: true, jpg: true, png: true, jpeg: true }
  return TYPE[item.split('.')[1]] 
})

emoticon = emoticon.filter((item, index) => index < 20)
// Build static service
app.get('*', (req, res) => {
  const assetsType = req.url.split('/')[1]
  if (assetsType == 'YouChat'){ // Home page
    const filepath = path.join(path.resolve('./dist'), 'index.html')
    res.sendFile(filepath)
  }
  if (assetsType == 'assets'){ // Client resources
    const filepath = path.join(path.resolve('./dist'), req.url)
    res.sendFile(filepath.split('?')[0]) // Go hash
  }
  if (assetsType == 'file'){ // Server resources
    const filepath = path.join(path.resolve('./'), req.url)
    res.sendFile(filepath)
  }
  if (assetsType == 'loadImg'){ // interface
    res.send({ret: 1, data: {portrait, emoticon}})
  }
})


// The connection event is triggered when each client socket connects
let userList = []
io.on('connection', (socket) => {
  // Sign in
  socket.on('login', userInfo => {
    userList.push(userInfo)
    socket.emit('userList', userList)
    socket.broadcast.emit('login', userInfo)
  })


  // Exit (built-in event)
  socket.on('disconnect', reason => {
    userList = userList.filter(item => item.id != socket.id)
    io.sockets.emit('quit', socket.id)
  })

  // Receive group chat messages
  socket.on('sendMessageGroup', message => {
    // send files
    if (message.file){
      const fileName = Date.now() + '.' + message.fileType
      fs.writeFile(`./file/uploadImg/${fileName}`, message.file, (err) => {
        delete message.file
        delete message.fileType
        if (err) {
          message.text = '[Failed to send picture]'
          io.sockets.emit('sendMessageGroup', message)
        } else {
          message.emoticon = `/file/uploadImg/${fileName}`
          io.sockets.emit('sendMessageGroup', message)
        }
      })
      return
    }
    // General news
    io.sockets.emit('sendMessageGroup', message)
  })
  

  // socket.on('typing', function(user) {
  //   socket.broadcast.emit('typing', user);
  // })

  // Receive private chat messages
  socket.on('sendMessageMember', message => {
    // send files
    if (message.file) {
      const fileName = Date.now() + '.' + message.fileType
      fs.writeFile(`./file/uploadImg/${fileName}`, message.file, (err) => {
        delete message.file
        delete message.fileType
        if (err) {
          message.text = '[Image sending failed]'
          socket.emit('sendMessageMember', message)
          io.to(message.memberId).emit('sendMessageMember', message)
        } else {
          message.emoticon = `/file/uploadImg/${fileName}`
          socket.emit('sendMessageMember', message)
          io.to(message.memberId).emit('sendMessageMember', message)
        }
      })
      return
    }
    //General news
    socket.emit('sendMessageMember', message)
    io.to(message.memberId).emit('sendMessageMember', message)
  })
})


server.listen(port, () => {
  console.log(`server runing on port ${port} ...`)
  console.log(`http://127.0.0.1:3000/YouChat`)
})


/*
Nodemon cooperates with webpack to package client code
npm command configuration
Packing error
The client is transformed into a new structure
*/
