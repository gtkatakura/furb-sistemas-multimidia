import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { socketConnect } from 'socket.io-react';
import Base from './Base';
import RequestControl from './RequestControl';

import './index.less';

class Game extends React.Component {
  constructor({ exercise }) {
    super();

    this.onMoving = _.throttle(this.onMoving, 100);

    this.state = {
      resolveds: {},
      requestControl: null,
      exercise,
    };
  }

  componentWillMount() {
    this.props.socket.emit('game:start');

    this.props.socket.on('observer:start', observerId => {
      const objects = this.game.getObjects().map(object => _.assign({}, object));

      this.props.socket.emit('observable:bootstrap', {
        observerId,
        objects,
        resolveds: this.game.state.resolveds,
      });
    });

    this.props.socket.on('observer:request:control', observerName => {
      this.setState({
        requestControl: observerName,
      });
    });

    this.props.socket.on('observer:moving', object => this.game.updateObject(object));
    this.props.socket.on('observer:resolveds', resolveds => this.setState({ resolveds }));

    this.setExercise(this.props.exercise);
  }

  componentWillReceiveProps({ exercise }) {
    this.setExercise(exercise);
  }

  componentWillUnmount() {
    this.props.socket.emit('game:end');
  }

  onMoving(object) {
    this.props.socket.emit('observable:moving', _.assign({}, object));
  }

  onItemResolve(resolveds) {
    this.props.socket.emit('observable:resolveds', resolveds);
  }

  onRequestControlResponse(response) {
    if (!response) {
      this.setState({
        requestControl: null,
      });
    }
  }

  onRequestControlStop() {
    this.setState({
      requestControl: null,
    });
  }

  setExercise(exercise) {
    const maxY = _.max(_.map(exercise[0].points, 'y')) / 2;
    const maxX = _.max(_.map(exercise[0].points, 'x')) / 2;

    this.polygons = _.filter(exercise, el => !el._distraction).map(object => (
      Object.assign({}, _.cloneDeep(object), {
        _fill: object.fill,
        selectable: false,
        fill: 'black',
        top: (this.props.height / 2) - maxY + object.top,
        left: (this.props.width / 2) - maxX + object.left,
      })
    ));

    this.objects = _.drop(exercise, 1).map((object, reference) => (
      Object.assign({}, _.cloneDeep(object), this.buildRandomPositions(object, maxX, maxY), {
        reference,
      })
    ));

    this.setState({ exercise });
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
    return (
      <div>
        {this.state.requestControl ? (
          <RequestControl
            userName={this.state.requestControl}
            onResponse={this.onRequestControlResponse.bind(this)}
            onStop={this.onRequestControlStop.bind(this)}
          />
        ) : null}
        <div id="game">
          <Base
            ref={game => { this.game = game; }}
            width={this.props.width}
            height={this.props.height}
            objects={this.objects}
            polygons={this.polygons}
            resolveds={this.state.resolveds}
            onMoving={this.onMoving.bind(this)}
            onItemResolve={this.onItemResolve.bind(this)}
          />
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
