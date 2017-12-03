import React from 'react';
import PropTypes from 'prop-types';
import { Canvas, Polygon } from 'react-fabricjs';
import _ from 'lodash';
import { socketConnect } from 'socket.io-react';

import './index.less';

class Game extends React.Component {
  constructor({ exercise }) {
    super();

    this.state = { exercise };
  }

  componentWillMount() {
    this.props.socket.on('observer:start', observerId => {
      const objects = this.canvas.getObjects().map(object => _.assign({}, object));

      this.props.socket.emit('observable:bootstrap', {
        observerId,
        objects,
      });
    });
  }

  componentWillReceiveProps({ exercise }) {
    this.setState({ exercise });
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

    const polygons = this.polygons.map((object, key) => (
      <Polygon
        key={key.toString()}
        object={object}
      />
    ));

    this.objects = _.drop(this.state.exercise, 1).map((object, reference) => (
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
        <Canvas width={this.props.width} height={this.props.height} ref={el => { this.canvas = el; }}>
          {polygons}
          {objects}
        </Canvas>
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
