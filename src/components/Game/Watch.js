import React from 'react';
import { Canvas, Polygon } from 'react-fabricjs';
import { socketConnect } from 'socket.io-react';

import './index.less';

class Watch extends React.Component {
  constructor() {
    super();

    this.state = {
      objects: [],
    };
  }

  componentWillMount() {
    this.startObserver(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.startObserver(nextProps);
  }

  startObserver(props) {
    this.props.socket.emit('observer:start', props.userName);

    this.props.socket.on('observable:bootstrap', objects => {
      this.setState({
        objects,
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

export default socketConnect(Watch);
