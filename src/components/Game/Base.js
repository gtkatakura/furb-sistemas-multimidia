import React from 'react';
import PropTypes from 'prop-types';
import { Canvas, Polygon } from 'react-fabricjs';
import _ from 'lodash';

import './index.less';

class Base extends React.Component {
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

      const object = _.find(game.props.objects, ['reference', this.reference]);

      _.assign(object, {
        top: this.top,
        left: this.left,
      });

      game.props.onMoving(this);
    }
  }

  getObjects() {
    return this.canvas.getObjects();
  }

  updateObject(object) {
    const fabricObject = this.canvas.getObjects().find(currentObject => currentObject.reference === object.reference);

    fabricObject.set({
      left: object.left,
      top: object.top,
    });

    const local = _.find(this.props.objects, ['reference', object.reference]);

    _.assign(local, {
      top: object.top,
      left: object.left,
    });

    this.canvas.renderAll();
  }

  render() {
    const polygons = this.props.polygons.map((object, key) => (
      <Polygon
        key={key.toString()}
        object={_.assign({}, object)}
      />
    ));

    const objects = this.props.objects.map((object, key) => (
      <Polygon
        key={key.toString()}
        object={_.assign({}, object)}
        onMoving={_.partial(this.onMoving, this)}
      />
    ));

    return (
      <div id="game">
        <Canvas width={this.props.width} height={this.props.height} ref={canvas => { this.canvas = canvas; }}>
          {polygons}
          {objects}
        </Canvas>
      </div>
    );
  }
}

Base.propTypes = {
  polygons: PropTypes.arrayOf(PropTypes.object),
  objects: PropTypes.arrayOf(PropTypes.object).isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  onMoving: PropTypes.func,
};

Base.defaultProps = {
  polygons: [],
  onMoving: _.noop,
};

export default Base;
