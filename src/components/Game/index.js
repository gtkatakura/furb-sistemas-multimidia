import React from 'react';
import PropTypes from 'prop-types';
import { Canvas, Polygon } from 'react-fabricjs';
import _ from 'lodash';
import { socketConnect } from 'socket.io-react';

import './index.less';

class Game extends React.Component {
  constructor({ exercise }) {
    super();

    this.state = {
      requestControlAccepted: false,
      requestControl: null,
      exercise,
    };
  }

  componentWillMount() {
    this.props.socket.emit('game:start');

    this.props.socket.on('observer:start', observerId => {
      const objects = this.canvas.getObjects().map(object => _.assign({}, object));

      this.props.socket.emit('observable:bootstrap', {
        observerId,
        objects,
      });
    });

    this.props.socket.on('observer:request:control', observerName => {
      this.setState({
        requestControl: observerName,
      });
    });

    this.props.socket.on('observer:moving', object => {
      const local = this.canvas.getObjects().find(currentObject => currentObject.reference === object.reference);

      local.set({
        left: object.left,
        top: object.top,
      });

      this.canvas.renderAll();
    });

    const maxY = _.max(_.map(this.state.exercise[0].points, 'y')) / 2;
    const maxX = _.max(_.map(this.state.exercise[0].points, 'x')) / 2;

    this.polygons = this.state.exercise.map(object => (
      Object.assign({}, _.cloneDeep(object), {
        selectable: false,
        fill: 'black',
        top: (this.props.height / 2) - maxY + object.top,
        left: (this.props.width / 2) - maxX + object.left,
      })
    ));

    this.objects = _.drop(this.state.exercise, 1).map((object, reference) => (
      Object.assign({}, _.cloneDeep(object), this.buildRandomPositions(object, maxX, maxY), {
        reference,
      })
    ));
  }

  componentWillReceiveProps({ exercise }) {
    this.setState({ exercise });
  }

  componentWillUnmount() {
    this.props.socket.emit('game:end');
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

      game.props.socket.emit('observable:moving', _.assign({}, this));
    }

    const local = _.find(game.objects, ['reference', this.reference]);

    _.assign(local, {
      top: this.top,
      left: this.left,
    });
  }

  onRequestControlAccept() {
    this.props.socket.emit('observable:request:control:response', {
      observerId: this.state.requestControl,
      response: true,
    });

    this.setState({
      requestControlAccepted: true,
    });
  }

  onRequestControlReject() {
    this.props.socket.emit('observable:request:control:response', {
      observerId: this.state.requestControl,
      response: false,
    });

    this.setState({
      requestControl: null,
      requestControlAccepted: false,
    });
  }

  buildRandomPositions(object, maxX, maxY) {
    const positions = {
      top: _.random(0, this.props.height - _.max(_.map(object.points, 'y'))),
      left: _.random(0, this.props.width - _.max(_.map(object.points, 'x'))),
    };

    const endPositions = {
      top: positions.top + _.max(_.map(object.points, 'y')),
      left: positions.left + _.max(_.map(object.points, 'x')),
    };

    const invalidPositions = {
      top: {
        begin: (this.props.height / 2) - maxY,
        end: (this.props.height / 2) + maxY,
      },
      left: {
        begin: (this.props.width / 2) - maxX,
        end: (this.props.width / 2) + maxX,
      },
    };

    if (endPositions.top > invalidPositions.top.begin && endPositions.top < invalidPositions.top.end) {
      return this.buildRandomPositions(object, maxX, maxY);
    }

    if (endPositions.left > invalidPositions.left.begin && endPositions.left < invalidPositions.left.end) {
      return this.buildRandomPositions(object, maxX, maxY);
    }

    if (positions.top > invalidPositions.top.begin && positions.top < invalidPositions.top.end) {
      return this.buildRandomPositions(object, maxX, maxY);
    }

    if (positions.left > invalidPositions.left.begin && positions.left < invalidPositions.left.end) {
      return this.buildRandomPositions(object, maxX, maxY);
    }

    return positions;
  }

  render() {
    const polygons = this.polygons.map((object, key) => (
      <Polygon
        key={key.toString()}
        object={object}
      />
    ));

    const objects = this.objects.map((object, key) => (
      <Polygon
        key={key.toString()}
        object={object}
        onMoving={_.partial(this.onMoving, this)}
      />
    ));

    return (
      <div>
        {this.state.requestControl ? (
          <p style={{ display: 'inline-block', width: '50%' }} className="alert alert-warning">
            O usuário {this.state.requestControl} pediu permissão para controlar o jogo. Deseja passar o controle?<br />
            <button className="btn btn-primary" onClick={this.onRequestControlAccept.bind(this)}>Sim</button>
            <button className="btn btn-danger" onClick={this.onRequestControlReject.bind(this)}>Não</button>
          </p>
        ) : null}
        <div id="game">
          <Canvas width={this.props.width} height={this.props.height} ref={el => { this.canvas = el; }}>
            {polygons}
            {objects}
          </Canvas>
        </div>
      </div>
    );
  }
}

Game.propTypes = {
  exercise: PropTypes.arrayOf(PropTypes.object).isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default socketConnect(Game);
