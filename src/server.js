const app = require('./app');
const knex = require('knex');
const { PORT, DATABASE_URL } = require('./config');

// Create an http websocket server
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const WebSocketClients = require('./websocket-clients');
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('new websocket from', req.url);
  WebSocketClients.addClient(ws, req);

  ws.on('message', message => {
    /* If the client sends us a changeRoom status of true,
    we will modify what type of messages they can accept from the
    WebSocket. This will help us to not send messages that would
    be irrelevant to them (e.g., if they are not in the chat 
    component, all they need is a notification of a new message) */
    console.log('message received');
    const data = JSON.parse(message);
    if (data.changeRoom === true) {
      let user = WebSocketClients.getClient(data.username);
      for (const value of ['receiveChats', 'receivePosts']) {
        if (data[value] !== undefined) {
          user[value] = data[value];
        }
      }
    }
  });
});

const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

app.set('db', db);

server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
