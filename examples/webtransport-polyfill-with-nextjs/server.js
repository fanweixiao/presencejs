const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const port = process.env.PORT || 5002;

app.use(express.static(__dirname + '/'));

app.ws('/', function(ws, req) {
  console.log('socket', req.testing);
  const id = setInterval(function() {
    ws.send(JSON.stringify(new Date()));
  }, 1000);

  console.log('websocket connection open');

  ws.on('close', function() {
    console.log('websocket connection close');
    clearInterval(id);
  });
});

app.ws('/to_upper_case', function(ws, req) {
  ws.on('message', msg => {
    console.log('msg: ', msg);
    ws.send(msg.toString().toUpperCase());
  });
});

app.listen(port);
