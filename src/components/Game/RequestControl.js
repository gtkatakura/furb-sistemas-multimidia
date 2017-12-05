import React from 'react';
import PropTypes from 'prop-types';
import { socketConnect } from 'socket.io-react';

class RequestControl extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      pending: true,
    };
  }

  onResponse(response) {
    this.props.socket.emit('observable:request:control:response', {
      observerId: this.props.userName,
      response,
    });

    this.props.onResponse(response);

    this.setState({
      pending: false,
    });
  }

  onStop() {
    this.props.socket.emit('observable:request:control:stop', {
      observerId: this.props.userName,
    });

    this.props.onStop();
  }

  render() {
    if (this.state.pending) {
      return (
        <p style={{ display: 'inline-block', width: '50%' }} className="alert alert-warning">
          O usuário {this.props.userName} pediu permissão para controlar o jogo. Deseja passar o controle?<br />
          <button className="btn btn-primary" onClick={this.onResponse.bind(this, true)}>Sim</button>
          <button className="btn btn-danger" onClick={this.onResponse.bind(this, false)}>Não</button>
        </p>
      );
    }

    return (
      <p style={{ display: 'inline-block', width: '50%' }} className="alert alert-warning">
        O usuário {this.props.userName} está conectado ao jogo.
        <button className="btn btn-sm btn-danger" onClick={this.onStop.bind(this)}>Revogar permissão</button>
      </p>
    );
  }
}

RequestControl.propTypes = {
  userName: PropTypes.string.isRequired,
  onResponse: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
};

export default socketConnect(RequestControl);
