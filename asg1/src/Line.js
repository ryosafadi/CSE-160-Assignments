class Line {
    constructor() {
      this.position = []; // [x1, y1, x2, y2]
      this.color = [1.0, 1.0, 1.0, 1.0];
    }
  
    render() {
      let [x1, y1, x2, y2] = this.position;
      let vertices = new Float32Array([x1, y1, x2, y2]);
      let vertexBuffer = gl.createBuffer();
      if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }
  
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
  
      gl.uniform4f(u_FragColor, ...this.color);
      gl.drawArrays(gl.LINES, 0, 2);
    }
  }
  