const socketio = require('socket.io'),
  logger = require('./logger'),
  { decodeToken } = require('./utils');

let io;
const users = {},
  init = (server, onMessage) => {
    io = socketio(server);

    io.on('connection', function(socket) {
      const query = socket.handshake.query || {},
        token = decodeToken(query.token),
        { ClientId, ClientName, UserName } = token;

      users[socket.id] = { ClientId, ClientName, UserName };
      socket.join(ClientId);
      logger.info(`Client: ${ClientName}, user: ${UserName} connected`);

      socket.on('disconnect', function(reason) {
        const { ClientId, ClientName, UserName } = users[socket.id];
        delete users[socket.id];
        socket.leave(ClientId);
        logger.info(
          `Client: ${ClientName}, user: ${UserName} disconnected, reaason: ${reason}`
        );
      });

      socket.on('msg', (msg) => {
        const { client, user } = socket;
        onMessage && onMessage(msg, { client, user });
      });
      //io.to(id).emit('chat', 'can you hear123?');
    });
  },
  sendTo = (msg, client, user) => {
    const id = Object.keys(users).find(
        (k) => (users[k].UserName = user && users[k].ClientID === client)
      ),
      socket = io.sockets.connected[id];
    if (socket) {
      socket.emit('msg', msg);
    }
  },
  sendToAll = (msg, client) => {
    io.to(client).emit('msg', msg);
  };

module.exports = { init, sendTo, sendToAll };
