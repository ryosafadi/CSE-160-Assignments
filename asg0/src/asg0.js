// DrawTriangle.js (c) 2012 matsuda

let canvas, ctx;

function main() {  
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 
  ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(v, color) {
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, canvas.height/2);
  ctx.lineTo(canvas.width / 2 + v.elements[0] * 20, canvas.height / 2 - v.elements[1] * 20);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function angleBetween(v1, v2) {
  let mag1 = v1.magnitude();
  let mag2 = v2.magnitude();
  let ang = Math.acos(Vector3.dot(v1, v2) / (mag1 * mag2)) * (180 / Math.PI);
  return ang;
}

function areaTriangle(v1, v2) {
  let mag = Vector3.cross(v1, v2).magnitude();
  let area = mag / 2;
  return area;
}

function handleDrawEvent() {
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let v1x = document.getElementById('v1x').value;
  let v1y = document.getElementById('v1y').value;

  let v2x = document.getElementById('v2x').value;
  let v2y = document.getElementById('v2y').value;

  let v1 = new Vector3([v1x, v1y, 0]);
  let v2 = new Vector3([v2x, v2y, 0]);

  drawVector(v1, 'rgba(255, 0, 0, 1.0)');
  drawVector(v2, 'rgba(0, 0, 255, 1.0)');
}

function handleDrawOperationEvent() {
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let v1x = document.getElementById('v1x').value;
  let v1y = document.getElementById('v1y').value;

  let v2x = document.getElementById('v2x').value;
  let v2y = document.getElementById('v2y').value;

  let v1 = new Vector3([v1x, v1y, 0]);
  let v2 = new Vector3([v2x, v2y, 0]);

  drawVector(v1, 'rgba(255, 0, 0, 1.0)');
  drawVector(v2, 'rgba(0, 0, 255, 1.0)');

  let operation = document.getElementById('op-select').value;

  switch (operation) {
    case 'add': {
      let v3 = v1.add(v2);
      drawVector(v3, 'rgba(0, 255, 0, 1.0)');
    } break;
    case 'sub': {
      let v3 = v1.sub(v2);
      drawVector(v3, 'rgba(0, 255, 0, 1.0)');
    } break;
    case 'mul': {
      let scalar = document.getElementById('scalar').value;
      let v3 = v1.mul(scalar);
      let v4 = v2.mul(scalar);

      drawVector(v3, 'rgba(0, 255, 0, 1.0)');
      drawVector(v4, 'rgba(0, 255, 0, 1.0)');
    } break;
    case 'div': {
      let scalar = document.getElementById('scalar').value;
      let v3 = v1.div(scalar);
      let v4 = v2.div(scalar);

      drawVector(v3, 'rgba(0, 255, 0, 1.0)');
      drawVector(v4, 'rgba(0, 255, 0, 1.0)');
    } break;
    case 'ang': {
      console.log('Angle: ' + angleBetween(v1, v2));
    } break;
    case 'area': {
      console.log('Area of the triangle: ' + areaTriangle(v1, v2));
    } break;
    case 'mag': {
      let mag1 = v1.magnitude();
      let mag2 = v2.magnitude();

      console.log('Magnitude of v1: ' + mag1);
      console.log('Magnitude of v2: ' + mag2);
    } break;
    case 'norm': {
      let norm1 = v1.normalize();
      let norm2 = v2.normalize();

      drawVector(norm1, 'rgba(0, 255, 0, 1.0)');
      drawVector(norm2, 'rgba(0, 255, 0, 1.0)');
    }
  }
}