const WebSocketClients = {
  clients: new Map(),
  addClient(ws, req) {
    let tempName = req.url.slice(1);
    // TODO: First check to see if they are in the map before adding
    this.clients.set(tempName, {
      username: tempName,
      receiveChats: false,
      receivePosts: false,
      receiveNotifications: true,
      ws
    });
  },
  getClient(username) {
    return this.clients.get(username);
  }
};

module.exports = WebSocketClients;
