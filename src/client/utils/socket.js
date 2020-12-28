import io from 'socket.io-client';
import { apiPort } from '../../appConfig';

let socket;
const loc = window.location,
  socketEndpoint = loc.origin.replace(loc.port, apiPort),
  init = (token, onMessage = () => {}, logger = {}) => {
    socket = io.connect(socketEndpoint, { query: { token } });

    //socket.emit('chat', '123');
    socket.on('msg', (msg) => {
      logger.info(JSON.stringify(msg));
      onMessage(msg);
    });
  },
  send = (msg) => socket.emit('msg', msg),
  close = () => {};

export { init, send, close };
