// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }
  `;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
  `;

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const DIAMOND = 2;
const CIRCLE = 3;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5.0;
let g_selectedType = POINT;
let g_selectedSegments = 10;

let g_isDrawing = false;
let g_lastDragPoint = null;

function addActionsForHtmlUI() {
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; pictureDrawn = false; renderAllShapes(); };
  document.getElementById('knightButton').onclick = function() { pictureDrawn = true; renderAllShapes(); };

  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT; };
  document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE; };
  document.getElementById('diaButton').onclick = function() { g_selectedType = DIAMOND; };
  document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE; };

  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value / 100; });
  document.getElementById('alphaSlide').addEventListener('mouseup', function() { g_selectedColor[3] = this.value / 100; });

  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; });
}

function main() {
  
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev) { g_isDrawing = true; handleClicks(ev); }
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) handleClicks(ev); };
  canvas.onmouseup = function() { g_isDrawing = false; g_lastDragPoint = null; };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function handleClicks(ev) {
  let [x, y] = convertCoordsEventToGL(ev);

  if (g_isDrawing && g_lastDragPoint) {
    let line = new Line();
    line.position = [...g_lastDragPoint, x, y];
    line.color = g_selectedColor.slice();
    g_shapesList.push(line);
  }

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else if (g_selectedType == DIAMOND) {
    point = new Diamond();
  } else if (g_selectedType == CIRCLE) {
    point = new Circle();
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  point.segments = g_selectedSegments;
  g_shapesList.push(point);

  if (g_isDrawing) {
    g_lastDragPoint = [x, y];
  }

  renderAllShapes();
}

let pictureDrawn = false;

function drawPicture() {
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
  drawTriangle([-5/8, -7/8, 5/8, 7/8, -5/8, 7/8]);
  drawTriangle([-5/8, -7/8, 5/8, -7/8, 5/8, 7/8]);
  gl.uniform4f(u_FragColor, 0.5, 0.5, 0.5, 1.0);
  drawTriangle([-1.75/8, -0.75/8, 3/8, -2/8, -1.5/8, 0]);
  drawTriangle([-1.4/8, -0.47/8, -2.2/8, -0.1/8, -2.3/8, -0.3/8]);
  gl.uniform4f(u_FragColor, 0.9, 0.9, 0.9, 1.0);
  drawTriangle([-2/8, 0, 2/8, 3/8, -2/8, 3/8]);
  drawTriangle([-2/8, 0, 2/8, 0, 2/8, 3/8]);
  drawTriangle([2/8, 3/8, 3/8, 4/8, 2/8, 4/8]);
  drawTriangle([2/8, 4/8, 3/8, 4/8, 2/8, 5/8]);
  drawTriangle([1/8, 5/8, 2/8, 4/8, 2/8, 5/8]);
  drawTriangle([-2/8, 3/8, -3/8, 4/8, -2/8, 4/8]);
  drawTriangle([-2/8, 4/8, -3/8, 4/8, -2/8, 5/8]);
  drawTriangle([-1/8, 5/8, -2/8, 4/8, -2/8, 5/8]);
  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
  drawTriangle([-1.5/8, 0.5/8, -0.5/8, 1.5/8, -1.5/8, 1.5/8]);
  drawTriangle([-1.5/8, 0.5/8, -0.5/8, 0.5/8, -0.5/8, 1.5/8]);
  drawTriangle([1.5/8, 0.5/8, 0.5/8, 1.5/8, 1.5/8, 1.5/8]);
  drawTriangle([1.5/8, 0.5/8, 0.5/8, 0.5/8, 0.5/8, 1.5/8]);
  drawTriangle([-1/8, -2.5/8, -1/8, -4/8, 0, -2/8]);
  drawTriangle([1/8, -2.5/8, 1/8, -4/8, 0, -2/8]);
  gl.uniform4f(u_FragColor, 0.1, 0.1, 0.2, 1.0);
  drawTriangle([-1/8, 0, -3/8, -3/8, -2/8, -3/8]);
  drawTriangle([1/8, 0, 3/8, -3/8, 2/8, -3/8]);
  drawTriangle([-1/8, 0, -2/8, -3/8, 0, -2/8]);
  drawTriangle([1/8, 0, 2/8, -3/8, 0, -2/8]);
  drawTriangle([-1/8, 0, 0, -2/8, 0, 0]);
  drawTriangle([1/8, 0, 0, 0, 0, -2/8]);
}

function convertCoordsEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (pictureDrawn) drawPicture();

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}
