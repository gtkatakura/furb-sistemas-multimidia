import React from 'react';
import PropTypes from 'prop-types';
import { Canvas, Polygon } from 'react-fabricjs';
import io from 'socket.io-client';

import './index.less';

class Watch extends React.Component {
  constructor() {
    super();

    this.socket = io();

    this.state = {
      objects: [],
    };
  }

  componentWillMount() {
    this.startObserver(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.socket.close();
    this.socket = io();

    this.startObserver(nextProps);
  }

  componentWillUnmount() {
    this.socket.close();
  }

  startObserver(props) {
    this.socket.emit('observer:start', props.userName);

    this.socket.on('observable:bootstrap', objects => {
      this.setState({
        objects,
      });
    });

    this.socket.on('observable:moving', object => {
      const local = this.canvas.getObjects().find(currentObject => currentObject.reference === object.reference);

      local.set({
        left: object.left,
        top: object.top,
      });

      this.canvas.renderAll();
    });
  }

  render() {
    this.objects = this.state.objects.map((object, key) => (
      <Polygon
        key={key.toString()}
        object={Object.assign({}, object, { selectable: false })}
      />
    ));

    return (
      <div id="game">
        <Canvas width={800} height={600} ref={canvas => { this.canvas = canvas; }}>
          {this.objects}
        </Canvas>
      </div>
    );
  }
}

Watch.propTypes = {
  userName: PropTypes.string.isRequired,
};

export default Watch;
