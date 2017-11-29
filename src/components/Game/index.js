import React from 'react';
import PropTypes from 'prop-types';
import { Canvas, Polygon } from 'react-fabricjs';
import _ from 'lodash';
import io from 'socket.io-client';

import './index.less';

class Game extends React.Component {
  constructor() {
    super();

    this.width = 800;
    this.height = 600;

    this.socket = io();

    this.socket.on('observer:start', observerId => {
      const objects = this.canvas.getObjects().map(object => _.assign({}, object));

      this.socket.emit('observable:bootstrap', {
        observerId,
        objects,
      });
    });
  }

  componentWillUnmount() {
    this.socket.close();
  }

  onMoving(game) {
    this.canvas.forEachObject(obj => {
      if (obj === this) return;

      if (Math.abs(obj.top - this.top) < 10 && Math.abs(obj.left - this.left) < 10) {
        this.set({
          top: obj.top,
          left: obj.left,
        });
      }
    });

    game.socket.emit('observable:moving', _.assign({}, this));
  }

  buildRandomPositions(object, maxX, maxY) {
    const positions = {
      top: _.random(0, this.height - _.max(_.map(object.points, 'y'))),
      left: _.random(0, this.width - _.max(_.map(object.points, 'x'))),
    };

    const endPositions = {
      top: positions.top + _.max(_.map(object.points, 'y')),
      left: positions.left + _.max(_.map(object.points, 'x')),
    };

    const invalidPositions = {
      top: {
        begin: (this.height / 2) - maxY,
        end: (this.height / 2) + maxY,
      },
      left: {
        begin: (this.width / 2) - maxX,
        end: (this.width / 2) + maxX,
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
    const maxY = _.max(_.map(this.props.exercise[0].points, 'y')) / 2;
    const maxX = _.max(_.map(this.props.exercise[0].points, 'x')) / 2;

    this.polygons = this.props.exercise.map(object => (
      Object.assign({}, _.cloneDeep(object), {
        selectable: false,
        fill: 'black',
        top: (this.height / 2) - maxY + object.top,
        left: (this.width / 2) - maxX + object.left,
      })
    ));

    const polygons = this.polygons.map((object, key) => (
      <Polygon
        key={key.toString()}
        object={object}
      />
    ));

    this.objects = _.drop(this.props.exercise, 1).map((object, reference) => (
      Object.assign({}, _.cloneDeep(object), this.buildRandomPositions(object, maxX, maxY), {
        reference,
      })
    ));

    const objects = this.objects.map((object, key) => (
      <Polygon
        key={key.toString()}
        object={object}
        onMoving={_.partial(this.onMoving, this)}
      />
    ));

    return (
      <div id="game">
        <Canvas width={this.width} height={this.height} ref={el => { this.canvas = el; }}>
          {polygons}
          {objects}
        </Canvas>
      </div>
    );
  }
}

Game.propTypes = {
  exercise: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Game;
