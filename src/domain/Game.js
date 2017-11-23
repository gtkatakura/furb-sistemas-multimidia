import React from 'react';
import { Canvas, Rect, Triangle, Polygon } from 'react-fabricjs';

const style = {
  border: '1px solid #000000',
};

export default class Game extends React.Component {
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
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 100, y: 100 },
    ];

    const points2 = [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 100, y: 100 },
    ];

    return (
      <div style={style}>
        <Canvas width={800} height={600}>
          <Rect selectable={false} left={20} top={20} width={200} height={200} fill="red" />
          <Triangle selectable={false} left={220} top={120} width={200} height={100} angle={180} fill="blue" />
          <Triangle selectable={false} left={70} top={20} width={100} height={50} angle={90} fill="yellow" />
          <Rect selectable={false} left={70} top={70} width={70} height={70} angle={45} fill="cyan" />
          <Polygon object={{ selectable: false, points, left: 20, top: 120, fill: "black" }} />
          <Polygon object={{ points: points2, left: 400, top: 400, fill:"purple" }} onMoving={this.onMoving} />
          <Triangle hasControls={false} left={320} top={420} width={200} height={100} angle={180} fill="purple" onMoving={this.onMoving} />
        </Canvas>
      </div>
    );
  }
}
