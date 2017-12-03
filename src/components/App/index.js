import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Login from './Login';
import Logged from './Logged';

import './index.less';

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      userName: sessionStorage.getItem('userName'),
    };
  }

  onStart(userName) {
    sessionStorage.setItem('userName', userName);
    this.setState({ userName });
  }

  render() {
    return (
      <Router>
        {this.state.userName ? <Logged userName={this.state.userName} /> : <Login onStart={this.onStart.bind(this)} />}
      </Router>
    );
  }
}
