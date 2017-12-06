import React from 'react';
import PropTypes from 'prop-types';
import { Canvas, Polygon } from 'react-fabricjs';
import _ from 'lodash';

import './index.less';

class Base extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      finished: false,
      objects: null,
      resolveds: {},
    };

    this.updateResolveds = _.debounce(this.updateResolveds, 300);
  }

  componentWillMount() {
    this.buildResolveds(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.buildResolveds(newProps);
  }

  onMoving(game) {
    if (this.canvas) {
      const object = _.find(game.props.objects, ['reference', this.reference]);
      const refs = game.getObjects().filter(el => !Number.isInteger(el.reference)).slice(1);

      this.canvas.forEachObject(obj => {
        if (obj === this) return;

        if (Math.abs(obj.top - this.top) < 10 && Math.abs(obj.left - this.left) < 10) {
          this.set({
            top: obj.top,
            left: obj.left,
          });

          if (obj._fill === this.fill && !_.some(game.state.resolveds[object._group].current, ['_fill', obj._fill])) {
            game.state.resolveds[object._group].current.push(obj);
          }
        } else if (obj._fill === this.fill && obj.fill === 'black') {
          _.remove(game.state.resolveds[object._group].current, ['_fill', obj._fill]);
        }
      });

      _.assign(object, {
        top: this.top,
        left: this.left,
      });

      game.props.onMoving(this);

      game.updateResolveds();
    }
  }

  getObjects() {
    return this.canvas.getObjects();
  }

  updateResolveds() {
    const itemComplete = ({ expected, current }) => expected.length === current.length;

    this.setState({
      finished: _.values(this.state.resolveds).every(itemComplete),
      resolveds: this.state.resolveds,
    });

    this.props.onItemResolve(
      _.mapValues(
        this.state.resolveds,
        values => _.mapValues(values, arr => arr.map(value => _.assign({}, value))),
      ),
    );
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

  buildResolveds({ objects, resolveds }) {
    if (_.isEmpty(resolveds) || (this.state.objects !== objects && !_.isEmpty(this.state.resolveds))) {
      _.assign(resolveds, _.mapValues(_.groupBy(objects, '_group'), value => ({
        expected: value,
        current: [],
      })));
    }

    this.setState({ resolveds, objects });
  }

  render() {
    const objects = this.props.polygons.concat(this.props.objects).map((object, key) => (
      <Polygon
        key={key.toString()}
        object={_.assign({ hasControls: false }, object)}
        onMoving={_.partial(this.onMoving, this)}
      />
    ));

    const helpItems = _.map(this.state.resolveds, (data, format) => (
      <p key={format} className="game-help-item">- {format}: {data.current.length} de {String(data.expected.length)}</p>
    ));

    return (
      <div id="game-container">
        <div id="game-left" />
        <div id="game-canvas">
          <Canvas width={this.props.width} height={this.props.height} ref={canvas => { this.canvas = canvas; }}>
            {objects}
          </Canvas>
        </div>
        <div id="game-help">
          <p>
            <h4>Resolva o problema utilizando:</h4>
            {helpItems}
          </p>
          {this.state.finished ? <button className="btn btn-success">Resolvido!</button> : null}
        </div>
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
  onItemResolve: PropTypes.func,
};

Base.defaultProps = {
  polygons: [],
  onMoving: _.noop,
  onItemResolve: _.noop,
};

export default Base;
