const express = require('express');
const http = require('http');

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);

const createServer = path => {
  const sockets = {};

  app.use(express.static(path));

  app.get('/users', (request, response) => {
    response.json(Object.keys(sockets));
  });

  app.get('*', (request, response) => {
    response.sendFile(`${path}/index.html`);
  });

  io.on('connection', socket => {
    socket.on('login', userName => {
      sockets[userName] = socket;
      socket.name = userName;

      io.emit('login', Object.keys(sockets));
      console.log(`io: a user connected - ${userName}`);
    });

    socket.on('disconnect', () => {
      delete sockets[socket.name];
      console.log(`io: a user disconnected - ${socket.name}`);
    });

    socket.on('observer:start', observableId => {
      socket.join(`observable:${observableId}`);

      if (sockets[observableId]) {
        sockets[observableId].emit('observer:start', socket.name);
      }
    });

    socket.on('observable:bootstrap', ({ observerId, objects }) => {
      if (sockets[observerId]) {
        sockets[observerId].emit('observable:bootstrap', objects);
      }
    });

    socket.on('observable:moving', object => {
      io.to(`observable:${socket.name}`).emit('observable:moving', object);
    });
  });

  server.listen(PORT, () => {
    console.log(`Listening on *:${PORT}`);
  });

  return server;
};

module.exports = { createServer, app, PORT };
