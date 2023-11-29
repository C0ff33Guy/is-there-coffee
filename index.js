const express = require('express');

const app = express();

const expressWs = require('express-ws')(app);

const status = {
  state: null,
  updatedAt: new Date,
}

function broadcast(data) {
  expressWs.getWss().clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  })
}

function state() {
  if (status.updatedAt.getDate() != (new Date).getDate()) {
    status.state = null;
    status.updatedAt = new Date();
  }

  return JSON.stringify({
    state: status.state,
    updatedAt: status.updatedAt.toISOString(),
  })
}

app.ws('/ws', (ws, req) => {
  console.log('WS connected');
  ws.send(state())
  ws.on('message', (msg) => {
    if (!['true', 'false'].includes(msg.toString())) return;
    const val = JSON.parse(msg);

    status.state = val;
    status.updatedAt = new Date();
    console.log(status.updatedAt, val)

    broadcast(state());
  })
})

app.use(express.static('public'));

app.listen(process.env.PORT || 80);
console.log('listening');