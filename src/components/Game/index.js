import React from 'react';
import PropTypes from 'prop-types';
import { Canvas, Polygon } from 'react-fabricjs';
import _ from 'lodash';
import io from 'socket.io-client';

import './index.less';

class Game extends React.Component {
  constructor() {
    super();

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

  render() {
    this.polygons = this.props.exercise.map(object => (
      Object.assign({}, _.cloneDeep(object), {
        selectable: false,
        fill: 'black',
      })
    ));

    const polygons = this.polygons.map((object, key) => (
      <Polygon
        key={key.toString()}
        object={object}
      />
    ));

    this.objects = _.drop(this.props.exercise, 1).map((object, reference) => (
      Object.assign({}, _.cloneDeep(object), {
        top: _.random(0, 200) + 200,
        left: _.random(0, 200) + 200,
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
        <Canvas width={800} height={600} ref={el => { this.canvas = el; }}>
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
