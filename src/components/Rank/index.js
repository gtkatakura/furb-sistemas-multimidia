import React from 'react';

import Watch from '../Game/Watch';

export default class Rank extends React.Component {
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
  }

  onClick(currentUser) {
    if (this.state.currentUser !== currentUser) {
      this.setState({ currentUser });
    }
  }

  render() {
    const lines = this.state.users.map((user, key) => (
      <a
        key={key.toString()}
        onClick={this.onClick.bind(this, user)}
      >
        {user}<br />
      </a>
    ));

    return (
      <div>
        {lines}
        {this.state.currentUser ? <Watch userName={this.state.currentUser} /> : null}
      </div>
    );
  }
}
