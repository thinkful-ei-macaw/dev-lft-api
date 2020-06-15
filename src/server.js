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

  ws.on('message', msg => {
    console.log(msg);
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
