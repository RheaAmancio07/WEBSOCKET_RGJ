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
      res.writeHead(404);
      res.end('404 Not Found')
    }
  })
})

// Monitor EventSource-test routing server to return event stream
app.get('/EventSource-test', (ewq, res) => {
  // Set the header according to the EventSource specification
  res.writeHead(200, {
    "Content-Type": "text/event-stream", //Specifies that the header is set to text/event-stream
    "Cache-Control": "no-cache" // Set the page not to be cached
  })
  // Use write to return the event stream. The event stream is just a simple text data stream, and each message is divided by a blank line (\n).
  res.write(':Comment' + '\n\n')  // Comment line
  res.write('data:' + 'Message content 1' + '\n\n') //Unnamed event

  res.write(  // named event
    'event: myEve' + '\n' +
    'data:' + 'Message content 2' + '\n' +
    'retry:' + '5000' + '\n' +
    'id:' + '12345' + '\n\n'
  )

  setInterval(() => { // Timed event
    res.write('data:' + 'Timed message' + '\n\n')
  }, 2000)
})

// Monitor 6788
app.listen(6788, () => {
  console.log(`server runing on port 6788 ...`)
})

// If disconnected, the client will reconnect regularly