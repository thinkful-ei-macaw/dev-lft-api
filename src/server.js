const app = require('./app');
const knex = require('knex');
const { PORT, DATABASE_URL } = require('./config');

// Connect to the database and set it on app
const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

app.set('db', db);

// Create a websocket server
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const WebSocketClients = require('./websocket-clients');
const WSAuthService = require('./wsauth/ws-auth-service');
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
  WebSocketClients.addClient(ws, req);

  ws.on('message', message => {
    /* If the client sends us a changeRoom status of true,
    we will modify what type of messages they can accept from the
    WebSocket. This will help us to not send messages that would
    be irrelevant to them (e.g., if they are not in the chat 
    component, all they need is a notification of a new message) */
    const messageData = JSON.parse(message);
    if (messageData.changeRoom === true) {
      let user = WebSocketClients.getClient(messageData.username);
      for (const value of ['receiveChats', 'receivePosts']) {
        if (messageData[value] !== undefined) {
          user[value] = messageData[value];
        }
      }
    }
  });
});

server.on('upgrade', async (req, socket, head) => {
  // Authentication
  try {
    const clientTicket = req.url.slice(1);
    const originalTicket = await WSAuthService.getItemWhere(db, {
      ticket: clientTicket
    });

    if (!originalTicket) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, ws => {
      wss.emit('connection', ws, req);
    });
  } catch (e) {
    socket.destroy();
    return;
  }
});

server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
