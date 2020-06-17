const WebSocketClients = {
  clients: new Map(),
  addClient(ws, req) {
    // This will set them into the Map with 'username' as the key
    // as it comes off the request url
    let username = req.url.slice(1).split('+')[0];
    this.clients.set(username, {
      username: username,
      receiveChats: false,
      receivePosts: false,
      receiveNotifications: true,
      ws
    });
  },
  // Will retrieve their websocket connection
  getClient(username) {
    return this.clients.get(username);
  }
};

module.exports = WebSocketClients;
