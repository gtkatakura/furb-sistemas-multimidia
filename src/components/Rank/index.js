import React from 'react';
import { socketConnect } from 'socket.io-react';
import _ from 'lodash';

import Watch from '../Game/Watch';
import './index.less';

class Rank extends React.Component {
  constructor() {
    super();

    this.state = {
      users: [],
      currentUser: null,
    };
  }

  async componentWillMount() {
    const response = await fetch('/users');
    const users = await response.json();

    this.setState({ users });

    this.props.socket.on('users:update', users => {
      this.setState({ users });
    });
  }

  onClick(currentUser) {
    if (this.state.currentUser !== currentUser) {
      this.setState({ currentUser });
    }
  }

  render() {
    const userName = sessionStorage.getItem('userName');
    const lines = this.state.users.map(({ name, playing }, key) => (
      <tr key={key.toString()}>
        <td>{name}</td>
        <td>0</td>
        <td>
          {playing && name !== userName ? <button className="btn btn-primary" onClick={this.onClick.bind(this, name)}>Assistir</button> : null}
        </td>
      </tr>
    ));

    return (
      <div>
        <div id="rank" className="table-responsive">
          <table className="table table-striped" cellSpacing="0" cellPadding="0">
            <thead>
              <tr>
                <th className="text-center">Nome</th>
                <th className="text-center">Pontuação</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lines}
            </tbody>
          </table>
        </div>
        {this.state.currentUser ? <Watch userName={this.state.currentUser} /> : null}
      </div>
    );
  }
}

export default socketConnect(Rank);
