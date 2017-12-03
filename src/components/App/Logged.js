import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { SocketProvider } from 'socket.io-react';
import io from 'socket.io-client';

import Menu from '../Menu';

import Rank from '../Rank';
import GameSet from '../GameSet';

const Logged = ({ userName }) => {
  const socket = io();

  socket.emit('login', userName);

  return (
    <SocketProvider socket={socket}>
      <div id="outer-container">
        <Menu />
        <main>
          <Switch>
            <Route exact path="/" component={Rank} />
            <Route path="/exercises" component={GameSet} />
          </Switch>
        </main>
      </div>
    </SocketProvider>
  );
};

Logged.propTypes = {
  userName: PropTypes.string.isRequired,
};

export default Logged;
