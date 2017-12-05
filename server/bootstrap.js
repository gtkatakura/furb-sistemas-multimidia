const express = require('express');
const http = require('http');
const _ = require('lodash/fp');

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);

const createServer = path => {
  const sockets = {};

  const getUsers = () => _.flow(
    _.values,
    _.map(_.pick(['name', 'playing'])),
  )(sockets);

  app.use(express.static(path));

  app.get('/users', (request, response) => {
    response.json(getUsers());
  });

  app.get('*', (request, response) => {
    response.sendFile(`${path}/index.html`);
  });

  io.on('connection', socket => {
    socket.on('login', userName => {
      sockets[userName] = socket;
      socket.name = userName;

      io.emit('users:update', getUsers());
      console.log(`io: a user connected - ${userName}`);
    });

    socket.on('game:start', () => {
      socket.playing = true;
      io.emit('users:update', getUsers());
    });

    socket.on('game:end', () => {
      socket.playing = false;
      io.emit('users:update', getUsers());
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

    socket.on('observer:request:control', observableId => {
      if (sockets[observableId]) {
        sockets[observableId].emit('observer:request:control', socket.name);
      }
    });

    socket.on('observer:moving', ({ observableId, object }) => {
      if (sockets[observableId]) {
        sockets[observableId].emit('observer:moving', object);
      }
    });

    socket.on('observable:request:control:response', ({ observerId, response }) => {
      if (sockets[observerId]) {
        sockets[observerId].emit('observable:request:control:response', response);
      }
    });

    socket.on('observable:request:control:stop', ({ observerId }) => {
      if (sockets[observerId]) {
        sockets[observerId].emit('observable:request:control:stop');
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
