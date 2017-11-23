import React from 'react';
import PropTypes from 'prop-types';
import { Canvas, Polygon } from 'react-fabricjs';
import _ from 'lodash';

const style = {
  border: '1px solid #000000',
};

class Game extends React.Component {
  onMoving() {
    if (this) {
      this.canvas.forEachObject(obj => {
        if (obj === this) return;

        if (Math.abs(obj.top - this.top) < 10 && Math.abs(obj.left - this.left) < 10) {
          this.set({
            top: obj.top,
            left: obj.left,
          });
        }
      });
    }
  }

  render() {
    const polygons = this.props.exercise.map((object, key) => (
      <Polygon
        key={key.toString()}
        object={Object.assign({}, _.cloneDeep(object), {
          selectable: false,
          fill: 'black',
        })}
      />
    ));

    const objects = _.drop(this.props.exercise, 1).map((object, key) => (
      <Polygon
        key={key.toString()}
        object={Object.assign({}, _.cloneDeep(object), {
          top: _.random(0, 200) + 200,
          left: _.random(0, 200) + 200,
        })}
        onMoving={this.onMoving}
      />
    ));

    return (
      <div style={style}>
        <Canvas width={800} height={600}>
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
