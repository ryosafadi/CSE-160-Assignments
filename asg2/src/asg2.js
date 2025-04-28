// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_GlobalZoomMatrix;
  void main() {
    gl_Position = u_GlobalZoomMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_GlobalZoomMatrix;

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  u_GlobalZoomMatrix = gl.getUniformLocation(gl.program, 'u_GlobalZoomMatrix');

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_globalAngleX = 0;
let g_globalAngleY = 60;
let g_globalZoom = 0.5;
let g_headAngle = 0;
let g_tailBaseAngleZ = 0;
let g_tailBaseAngleX = 0;
let g_tailLowerJointAngle = 0;
let g_tailUpperJointAngle = 0;
let g_rightFrontLegAngle = 0;
let g_leftFrontLegAngle = 0;
let g_rightBackLegAngle = 0;
let g_leftBackLegAngle = 0;
let g_dilationFactor = 0;
let g_animation = true;

function addActionsForHtmlUI() {
  document.getElementById('animOn').onclick = function() { g_animation = true; };
  document.getElementById('animOff').onclick = function() { g_animation = false; };
  document.getElementById('headSlide').addEventListener('input', function() { g_headAngle = this.value; renderScene(); });
  document.getElementById('tailBaseSlide').addEventListener('input', function() { g_tailBaseAngleZ = this.value; renderScene(); });
  document.getElementById('tailLowerJointSlide').addEventListener('input', function() { g_tailLowerJointAngle = this.value; renderScene(); });
  document.getElementById('tailUpperJointSlide').addEventListener('input', function() { g_tailUpperJointAngle = this.value; renderScene(); });

  // Mouse drag to rotate camera
  let isDragging = false;
  let lastX = -1, lastY = -1;

  canvas.onmousedown = function(ev) {
    isDragging = true;
    lastX = ev.clientX;
    lastY = ev.clientY;
  };
  canvas.onmouseup = function(ev) {
    isDragging = false;
  };
  canvas.onmousemove = function(ev) {
    if (isDragging) {
      let deltaX = ev.clientX - lastX;
      let deltaY = ev.clientY - lastY;
      g_globalAngleY += deltaX * 0.5;
      g_globalAngleX += deltaY * 0.5;
      g_globalAngleX = Math.max(Math.min(g_globalAngleX, 90), -90); // clamp X rotation to [-90, 90]
      lastX = ev.clientX;
      lastY = ev.clientY;
      renderScene();
    }
  };

  // Mouse wheel to zoom
  canvas.addEventListener('wheel', function(ev) {
    if (ev.deltaY < 0) {
      g_globalZoom *= 1.05;
    } else {
      g_globalZoom /= 1.05;
    }
    g_globalZoom = Math.min(Math.max(g_globalZoom, 0.1), 0.65); // clamp zoom
    renderScene();
  });

  // Shift + mouse down to dilate pupils
  canvas.addEventListener('mousedown', function(ev) {
    if (ev.shiftKey) {
      dialatePupils();
    }
  });
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  gl.clearColor(0.25, 0.65, 0.9, 1.0);
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_animation) {
    g_headAngle = 3 * Math.sin(g_seconds * 4.0);
    g_rightFrontLegAngle = 15 * Math.sin(g_seconds * 4.0);
    g_leftFrontLegAngle = 15 * -Math.sin(g_seconds * 4.0);
    g_rightBackLegAngle = 15 * -Math.sin(g_seconds * 4.0);
    g_leftBackLegAngle = 15 * Math.sin(g_seconds * 4.0);
    g_tailBaseAngleX = 5 * Math.sin(g_seconds * 4.0);
    g_tailLowerJointAngle = 10 * Math.sin(g_seconds * 4.0);
    g_tailUpperJointAngle = 15 * Math.sin(g_seconds * 4.0);
  }
}

function dialatePupils() {
  const targetDilation = 0.4;
  const duration = 1000;
  const startTime = performance.now();

  function animateDilation() {
    const elapsedTime = performance.now() - startTime;
    const progress = elapsedTime / duration;
    g_dilationFactor = Math.min(progress * targetDilation, targetDilation);

    if (g_dilationFactor < targetDilation) {
      requestAnimationFrame(animateDilation);
    } else {
      setTimeout(function() {
        g_dilationFactor = 0;
      }, 2000);
    }
  }

  animateDilation();
}

function renderScene() {
  let startTime = performance.now();
  
  let globalRotMat = new Matrix4()
    .rotate(g_globalAngleX, 1, 0, 0)
    .rotate(g_globalAngleY, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  let globalZoomMat = new Matrix4().scale(g_globalZoom, g_globalZoom, g_globalZoom);
  gl.uniformMatrix4fv(u_GlobalZoomMatrix, false, globalZoomMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let body = new Matrix4();
  body.setTranslate(-0.75, 0, 0);
  let bodyMatrix = new Matrix4(body);
  body.scale(1.5, 0.5, 0.5);
  drawCube(body, [0.3, 0.3, 0.3, 1.0]);

  let headMatrix = new Matrix4();
  headMatrix.setTranslate(0.5, 0.25, -0.05);
  headMatrix.rotate(-g_headAngle, 0, 0, 1);
  headMatrix.scale(0.6, 0.6, 0.6);
  drawCube(headMatrix, [0.3, 0.3, 0.3, 1.0]);

  let rightEarMatrix = new Matrix4(headMatrix);
  rightEarMatrix.translate(0, 1, 0);
  rightEarMatrix.scale(0.4, 0.4, 0.3);
  drawTriPrism(rightEarMatrix, [0.3, 0.3, 0.3, 1.0]);

  let leftEarMatrix = new Matrix4(headMatrix);
  leftEarMatrix.translate(0, 1, 0.7);
  leftEarMatrix.scale(0.4, 0.4, 0.3);
  drawTriPrism(leftEarMatrix, [0.3, 0.3, 0.3, 1.0]);

  let rightInnerEarMatrix = new Matrix4(rightEarMatrix);
  rightInnerEarMatrix.translate(0.18, 0.1, 0.1);
  rightInnerEarMatrix.scale(0.8, 0.8, 0.8);
  drawTriPrism(rightInnerEarMatrix, [0.95, 0.58, 0.91, 1.0]);

  let leftInnerEarMatrix = new Matrix4(leftEarMatrix);
  leftInnerEarMatrix.translate(0.18, 0.1, 0.1);
  leftInnerEarMatrix.scale(0.8, 0.8, 0.8);
  drawTriPrism(leftInnerEarMatrix, [0.95, 0.58, 0.91, 1.0]);

  let rightEyeMatrix = new Matrix4(headMatrix);
  rightEyeMatrix.translate(0.72, 0.5, 0.125);
  rightEyeMatrix.scale(0.3, 0.3, 0.3);
  drawCube(rightEyeMatrix, [0.12, 0.6, 0.23, 1.0]);

  let leftEyeMatrix = new Matrix4(headMatrix);
  leftEyeMatrix.translate(0.72, 0.5, 0.575);
  leftEyeMatrix.scale(0.3, 0.3, 0.3);
  drawCube(leftEyeMatrix, [0.12, 0.6, 0.23, 1.0]);

  let rightPupilMatrix = new Matrix4(rightEyeMatrix);
  rightPupilMatrix.translate(0.61, 0.3 - g_dilationFactor * 0.5, 0.3 - g_dilationFactor * 0.5);
  rightPupilMatrix.scale(0.4, 0.4 + g_dilationFactor, 0.4 + g_dilationFactor);
  drawCube(rightPupilMatrix, [0.0, 0.0, 0.0, 1.0]);

  let leftPupilMatrix = new Matrix4(leftEyeMatrix);
  leftPupilMatrix.translate(0.61, 0.3 - g_dilationFactor * 0.5, 0.3 - g_dilationFactor * 0.5);
  leftPupilMatrix.scale(0.4, 0.4 + g_dilationFactor, 0.4 + g_dilationFactor);
  drawCube(leftPupilMatrix, [0.0, 0.0, 0.0, 1.0]);

  let rightFrontLegMatrix = new Matrix4(bodyMatrix);
  rightFrontLegMatrix.translate(1.25, 0.2, 0.0);
  rightFrontLegMatrix.rotate(g_rightFrontLegAngle, 0, 0, 1);
  rightFrontLegMatrix.scale(0.25, -0.7, 0.15);
  drawCube(rightFrontLegMatrix, [0.3, 0.3, 0.3, 1.0]);

  let leftFrontLegMatrix = new Matrix4(bodyMatrix);
  leftFrontLegMatrix.translate(1.25, 0.2, 0.35);
  leftFrontLegMatrix.rotate(g_leftFrontLegAngle, 0, 0, 1);
  leftFrontLegMatrix.scale(0.25, -0.7, 0.15);
  drawCube(leftFrontLegMatrix, [0.3, 0.3, 0.3, 1.0]);

  let rightBackLegMatrix = new Matrix4(bodyMatrix);
  rightBackLegMatrix.translate(0, 0.2, 0.0);
  rightBackLegMatrix.rotate(g_rightBackLegAngle, 0, 0, 1);
  rightBackLegMatrix.scale(0.25, -0.7, 0.15);
  drawCube(rightBackLegMatrix, [0.3, 0.3, 0.3, 1.0]);

  let leftBackLegMatrix = new Matrix4(bodyMatrix);
  leftBackLegMatrix.translate(0, 0.2, 0.35);
  leftBackLegMatrix.rotate(g_leftBackLegAngle, 0, 0, 1);
  leftBackLegMatrix.scale(0.25, -0.7, 0.15);
  drawCube(leftBackLegMatrix, [0.3, 0.3, 0.3, 1.0]);

  let tailBase = new Matrix4(bodyMatrix);
  tailBase.translate(0, 0.35, 0.175);
  tailBase.rotate(-g_tailBaseAngleZ, 0, 0, 1);
  tailBase.rotate(-g_tailBaseAngleX, 1, 0, 0);
  let tailBaseMatrix = new Matrix4(tailBase);
  tailBase.scale(0.1, 0.5, 0.1);
  drawCube(tailBase, [0.3, 0.3, 0.3, 1.0]);

  let tailLowerJoint = new Matrix4(tailBaseMatrix);
  tailLowerJoint.translate(0, 0.45, 0.05);
  tailLowerJoint.rotate(-g_tailLowerJointAngle, 1, 0, 0);
  let tailLowerJointMatrix = new Matrix4(tailLowerJoint);
  tailLowerJoint.scale(0.1, 0.5, 0.1);
  tailLowerJoint.translate(0, 0, -0.5);
  drawCube(tailLowerJoint, [0.3, 0.3, 0.3, 1.0]);

  let tailUpperJointMatrix = new Matrix4(tailLowerJointMatrix);
  tailUpperJointMatrix.translate(0, 0.45, 0);
  tailUpperJointMatrix.rotate(-g_tailUpperJointAngle, 1, 0, 0);
  tailUpperJointMatrix.scale(0.1, 0.5, 0.1);
  tailUpperJointMatrix.translate(0, 0, -0.5);
  drawCube(tailUpperJointMatrix, [0.3, 0.3, 0.3, 1.0]);

  let duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "perfData");
}

sendTextToHTML = function(text, htmlID) {
  var htmlElement = document.getElementById(htmlID);
  if (!htmlElement) {
    console.log("Failed to get the element with id: " + htmlID);
    return;
  }
  htmlElement.innerHTML = text;
}