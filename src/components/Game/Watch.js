import React from 'react';
import PropTypes from 'prop-types';
import { socketConnect } from 'socket.io-react';
import _ from 'lodash';
import Base from './Base';

import './index.less';

class Watch extends React.Component {
  constructor() {
    super();

    this.state = {
      inControl: false,
      requestControl: false,
      objects: [],
      resolveds: [],
    };
  }

  componentWillMount() {
    this.startObserver(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.startObserver(nextProps);
  }

  onPermitControl() {
    if (!this.state.requestControl) {
      this.props.socket.emit('observer:request:control', this.props.userName);

      this.setState({
        requestControl: true,
      });
    }
  }

  onMoving(object) {
    this.props.socket.emit('observer:moving', {
      observableId: this.props.userName,
      object: _.assign({}, object),
    });
  }

  onItemResolve(resolveds) {
    this.props.socket.emit('observer:resolveds', {
      observableId: this.props.userName,
      resolveds,
    });
  }

  startObserver(props) {
    this.props.socket.emit('observer:start', props.userName);

    this.props.socket.on('observable:bootstrap', ({ objects, resolveds }) => {
      this.setState({
        objects: objects.map(object => _.pick(object, ['points', 'fill', 'height', 'width', 'left', 'top', 'reference', '_fill', '_group'])),
        resolveds,
      });
    });

    this.props.socket.on('observable:moving', object => this.game.updateObject(object));
    this.props.socket.on('observable:resolveds', resolveds => this.setState({ resolveds }));

    this.props.socket.on('observable:request:control:response', response => {
      if (response) {
        this.setState({
          inControl: true,
        });
      } else {
        this.setState({
          requestControl: false,
        });
      }
    });

    this.props.socket.on('observable:request:control:stop', () => {
      this.setState({
        requestControl: false,
        inControl: false,
      });
    });
  }

  controlStatus() {
    if (this.state.requestControl) {
      return this.state.inControl ? 'Conectado' : 'Aguardando resposta';
    }

    return 'Pedir controle';
  }

  render() {
    this.state.objects.forEach(object => Object.assign(object, {
      selectable: this.state.inControl && _.isNumber(object.reference),
    }));

    return (
      <div id="watch-container">
        <div id="watch-message">
          <div className="alert alert-success">
            Você está assistindo: <strong>{this.props.userName}</strong>
          </div>
          <button className="btn btn-primary" onClick={this.onPermitControl.bind(this)}>{this.controlStatus()}</button>
        </div>
        <div id="game">
          <Base
            ref={game => { this.game = game; }}
            width={600}
            height={600}
            objects={this.state.objects}
            resolveds={this.state.resolveds}
            onMoving={this.onMoving.bind(this)}
            onItemResolve={this.onItemResolve.bind(this)}
          />
        </div>
      </div>
    );
  }
}

Watch.propTypes = {
  userName: PropTypes.string.isRequired,
};

export default socketConnect(Watch);
