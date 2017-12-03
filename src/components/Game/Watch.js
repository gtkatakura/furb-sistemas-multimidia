import React from 'react';
import { Canvas, Polygon } from 'react-fabricjs';
import { socketConnect } from 'socket.io-react';
import _ from 'lodash';

import './index.less';

class Watch extends React.Component {
  constructor() {
    super();

    this.state = {
      inControl: false,
      requestControl: false,
      objects: [],
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

  onMoving(game) {
    if (this.canvas) {
      this.canvas.forEachObject(obj => {
        if (obj === this) return;

        if (Math.abs(obj.top - this.top) < 10 && Math.abs(obj.left - this.left) < 10) {
          this.set({
            top: obj.top,
            left: obj.left,
          });
        }
      });

      game.props.socket.emit('observer:moving', {
        observableId: game.props.userName,
        object: _.assign({}, this),
      });
    }

    const local = _.find(game.objects, ['reference', this.reference]);

    _.assign(local, {
      top: this.top,
      left: this.left,
    });
  }

  startObserver(props) {
    this.props.socket.emit('observer:start', props.userName);

    this.props.socket.on('observable:bootstrap', objects => {
      this.setState({
        objects: objects.map(object => _.pick(object, ['points', 'fill', 'height', 'width', 'left', 'top', 'reference'])),
      });
    });

    this.props.socket.on('observable:moving', object => {
      const local = this.canvas.getObjects().find(currentObject => currentObject.reference === object.reference);

      local.set({
        left: object.left,
        top: object.top,
      });

      this.canvas.renderAll();
    });

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
  }

  render() {
    this.objects = this.state.objects.map((object, key) => (
      <Polygon
        key={key.toString()}
        object={Object.assign({}, object, (!this.state.inControl || !_.isNumber(object.reference)) ? { selectable: false } : { selectable: true })}
        onMoving={_.partial(this.onMoving, this)}
      />
    ));

    return (
      <div id="game-container">
        <div id="game-message">
          <div className="alert alert-success">
            Você está assistindo: <strong>{this.props.userName}</strong>
          </div>
          <button className="btn btn-primary" onClick={this.onPermitControl.bind(this)}>{this.state.requestControl ? 'Aguardando resposta' : 'Pedir controle'}</button>
        </div>
        <div id="game">
          <Canvas width={600} height={600} ref={canvas => { this.canvas = canvas; }}>
            {this.objects}
          </Canvas>
        </div>
      </div>
    );
  }
}

export default socketConnect(Watch);
