const Service = require('../base-service');

class WSAuthService extends Service {
  constructor(table_name) {
    super(table_name);
  }
}

module.exports = new WSAuthService('ws_tickets');
