// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }
`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
    }
  }
`;

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;

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
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_globalAngleX = 0;
let g_globalAngleY = 0;
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
  canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
  });

  document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement === canvas) {
        const sensitivity = 0.1;
        g_camera.yaw += e.movementX * sensitivity;
        g_camera.pitch -= e.movementY * sensitivity;

        // Clamp pitch to avoid flipping over
        g_camera.pitch = Math.max(-89, Math.min(89, g_camera.pitch));

        g_camera.updateAtFromAngles();
    }
  });
}

function initTextures() {
  var image0 = new Image();
  var image1 = new Image();
  var image2 = new Image();
  if (!image0 || !image1 || !image2) {
    console.log('Failed to create one of the image objects');
    return false;
  }
  // Register the event handler to be called on loading an image
  image0.onload = function(){ sendImageToTEXTURE0(image0); };
  image0.src = 'grass.jpg';

  image1.onload = function(){ sendImageToTEXTURE1(image1); };
  image1.src = 'bricks.jpg';

  image2.onload = function(){ sendImageToTEXTURE2(image2); };
  image2.src = 'lostcat.jpg';

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture(); // Create the texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  gl.activeTexture(gl.TEXTURE0);             // Enable texture unit0
  gl.bindTexture(gl.TEXTURE_2D, texture);    // Bind the texture object

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Check if image dimensions are powers of two
  function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }

  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    // Generate mipmaps and apply trilinear filtering
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  } else {
    // Fallback for NPOT textures
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  // Assign the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
}

function sendImageToTEXTURE1(image) {
  var texture = gl.createTexture(); // Create the texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE1);             // Enable texture unit1
  gl.bindTexture(gl.TEXTURE_2D, texture);    // Bind the texture object

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Check if image dimensions are powers of two
  function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }

  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    // Generate mipmaps and use trilinear filtering
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  } else {
    // Fallback for NPOT textures (no mipmaps)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  // Assign the texture unit to the sampler
  gl.uniform1i(u_Sampler1, 1);
}

function sendImageToTEXTURE2(image) {
  var texture = gl.createTexture(); // Create the texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE2);             // Enable texture unit1
  gl.bindTexture(gl.TEXTURE_2D, texture);    // Bind the texture object

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Check if image dimensions are powers of two
  function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }

  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    // Generate mipmaps and use trilinear filtering
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  } else {
    // Fallback for NPOT textures (no mipmaps)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  // Assign the texture unit to the sampler
  gl.uniform1i(u_Sampler2, 2);
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  document.onkeydown = keydown;
  initTextures();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);
}

function keydown(ev) {
  if (ev.keyCode === 87) { // W
    g_camera.forward();
  }
  if (ev.keyCode === 65) { // A
    g_camera.moveLeft();
  }
  if (ev.keyCode === 83) { // S
    g_camera.backward();
  }
  if (ev.keyCode === 68) { // D
    g_camera.moveRight();
  }
  if (ev.keyCode === 81) { // Q
    g_camera.rotateLeft();
  }
  if (ev.keyCode === 69) { // E
    g_camera.rotateRight();
  }

  renderScene();
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;
  renderScene();
  requestAnimationFrame(tick);
}

var g_camera = new Camera();

const g_map = [
  [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
];

function drawMap() {
  const cube = new Cube();
  //cube.color = [0.79, 0.37, 0.25, 1.0];
  cube.textureNum = 1;

  for (let x = 0; x < 32; x++) {
    const row = g_map[x];

    for (let y = 0; y < 32; y++) {
      if (row[y] != 0) {
        for (let i = 0; i < row[y]; i++) {
          if (x == 15 && y == 22 && i == 2) {
            cube.textureNum = 2;
          }
          const transform = new Matrix4();
          transform.setTranslate(x - 16 + 0.5, -0.74 + i, y - 16 + 0.5);  // center in cell
          transform.scale(1, 1, 1);  // size to 1x1 cell
          cube.matrix = transform;
          cube.renderfastUV();
          cube.textureNum = 1;
        }
      }
    }
  }
}

function renderScene() {
  let startTime = performance.now();

  let projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width / canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  let viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
    g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  let globalRotMat = new Matrix4()
    .rotate(g_globalAngleX, 1, 0, 0)
    .rotate(g_globalAngleY, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawMap();

  let sky = new Cube();
  sky.color = [0.25, 0.65, 0.9, 1.0];
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.renderShadowless();

  let floor = new Cube();
  floor.color = [0.0, 1.0, 0.0, 1.0];
  floor.textureNum = 0;
  floor.matrix.setTranslate(0, -0.75, 0);
  floor.matrix.scale(32, 0, 32);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.renderShadowless();

  let body = new Cube();
  body.color = [0.3, 0.3, 0.3, 1.0];
  body.matrix.setTranslate(12.25, -0.249, -12);
  body.matrix.rotate(180, 0, 1, 0);
  let bodyMatrix = new Matrix4(body.matrix);
  body.matrix.scale(1.5, 0.5, 0.5);
  body.render();

  let head = new Cube();
  head.color = [0.3, 0.3, 0.3, 1.0];
  head.matrix.set(bodyMatrix);
  head.matrix.translate(1.25, 0.35, -0.05);
  head.matrix.rotate(-g_headAngle, 0, 0, 1);
  head.matrix.scale(0.6, 0.6, 0.6);
  head.render();

  let rightEar = new TriPrism();
  rightEar.color = [0.3, 0.3, 0.3, 1.0];
  rightEar.matrix.set(head.matrix);
  rightEar.matrix.translate(0, 1, 0);
  rightEar.matrix.scale(0.4, 0.4, 0.3);
  rightEar.render();

  let leftEar = new TriPrism();
  leftEar.color = [0.3, 0.3, 0.3, 1.0];
  leftEar.matrix.set(head.matrix);
  leftEar.matrix.translate(0, 1, 0.7);
  leftEar.matrix.scale(0.4, 0.4, 0.3);
  leftEar.render();

  let rightInnerEar = new TriPrism();
  rightInnerEar.color = [0.95, 0.58, 0.91, 1.0];
  rightInnerEar.matrix.set(rightEar.matrix);
  rightInnerEar.matrix.translate(0.18, 0.1, 0.1);
  rightInnerEar.matrix.scale(0.8, 0.8, 0.8);
  rightInnerEar.render();

  let leftInnerEar = new TriPrism();
  leftInnerEar.color = [0.95, 0.58, 0.91, 1.0];
  leftInnerEar.matrix.set(leftEar.matrix);
  leftInnerEar.matrix.translate(0.18, 0.1, 0.1);
  leftInnerEar.matrix.scale(0.8, 0.8, 0.8);
  leftInnerEar.render();

  let rightEye = new Cube();
  rightEye.color = [0.12, 0.6, 0.23, 1.0];
  rightEye.matrix.set(head.matrix);
  rightEye.matrix.translate(0.72, 0.5, 0.125);
  rightEye.matrix.scale(0.3, 0.3, 0.3);
  rightEye.render();

  let leftEye = new Cube();
  leftEye.color = [0.12, 0.6, 0.23, 1.0];
  leftEye.matrix.set(head.matrix);
  leftEye.matrix.translate(0.72, 0.5, 0.575);
  leftEye.matrix.scale(0.3, 0.3, 0.3);
  leftEye.render();

  let rightPupil = new Cube();
  rightPupil.color = [0.0, 0.0, 0.0, 1.0];
  rightPupil.matrix.set(rightEye.matrix);
  rightPupil.matrix.translate(0.61, 0.3 - g_dilationFactor * 0.5, 0.3 - g_dilationFactor * 0.5);
  rightPupil.matrix.scale(0.4, 0.4 + g_dilationFactor, 0.4 + g_dilationFactor);
  rightPupil.render();

  let leftPupil = new Cube();
  leftPupil.color = [0.0, 0.0, 0.0, 1.0];
  leftPupil.matrix.set(leftEye.matrix);
  leftPupil.matrix.translate(0.61, 0.3 - g_dilationFactor * 0.5, 0.3 - g_dilationFactor * 0.5);
  leftPupil.matrix.scale(0.4, 0.4 + g_dilationFactor, 0.4 + g_dilationFactor);
  leftPupil.render();

  let rightFrontLeg = new Cube();
  rightFrontLeg.color = [0.3, 0.3, 0.3, 1.0];
  rightFrontLeg.matrix.set(bodyMatrix);
  rightFrontLeg.matrix.translate(1.25, 0.2, 0.0);
  rightFrontLeg.matrix.rotate(g_rightFrontLegAngle, 0, 0, 1);
  rightFrontLeg.matrix.scale(0.25, -0.7, 0.15);
  rightFrontLeg.render();

  let leftFrontLeg = new Cube();
  leftFrontLeg.color = [0.3, 0.3, 0.3, 1.0];
  leftFrontLeg.matrix.set(bodyMatrix);
  leftFrontLeg.matrix.translate(1.25, 0.2, 0.35);
  leftFrontLeg.matrix.rotate(g_leftFrontLegAngle, 0, 0, 1);
  leftFrontLeg.matrix.scale(0.25, -0.7, 0.15);
  leftFrontLeg.render();

  let rightBackLeg = new Cube();
  rightBackLeg.color = [0.3, 0.3, 0.3, 1.0];
  rightBackLeg.matrix.set(bodyMatrix);
  rightBackLeg.matrix.translate(0, 0.2, 0.0);
  rightBackLeg.matrix.rotate(g_rightBackLegAngle, 0, 0, 1);
  rightBackLeg.matrix.scale(0.25, -0.7, 0.15);
  rightBackLeg.render();

  let leftBackLeg = new Cube();
  leftBackLeg.color = [0.3, 0.3, 0.3, 1.0];
  leftBackLeg.matrix.set(bodyMatrix);
  leftBackLeg.matrix.translate(0, 0.2, 0.35);
  leftBackLeg.matrix.rotate(g_leftBackLegAngle, 0, 0, 1);
  leftBackLeg.matrix.scale(0.25, -0.7, 0.15);
  leftBackLeg.render();

  let tailBase = new Cube();
  tailBase.color = [0.3, 0.3, 0.3, 1.0];
  tailBase.matrix.set(bodyMatrix);
  tailBase.matrix.translate(0, 0.35, 0.175);
  tailBase.matrix.rotate(-g_tailBaseAngleZ, 0, 0, 1);
  tailBase.matrix.rotate(-g_tailBaseAngleX, 1, 0, 0);
  let tailBaseMatrix = new Matrix4(tailBase.matrix);
  tailBase.matrix.scale(0.1, 0.5, 0.1);
  tailBase.render();

  let tailLowerJoint = new Cube();
  tailLowerJoint.color = [0.3, 0.3, 0.3, 1.0];
  tailLowerJoint.matrix.set(tailBaseMatrix);
  tailLowerJoint.matrix.translate(0, 0.45, 0.05);
  tailLowerJoint.matrix.rotate(-g_tailLowerJointAngle, 1, 0, 0);
  let tailLowerJointMatrix = new Matrix4(tailLowerJoint.matrix);
  tailLowerJoint.matrix.scale(0.1, 0.5, 0.1);
  tailLowerJoint.matrix.translate(0, 0, -0.5);
  tailLowerJoint.render();

  let tailUpperJoint = new Cube();
  tailUpperJoint.color = [0.3, 0.3, 0.3, 1.0];
  tailUpperJoint.matrix.set(tailLowerJointMatrix);
  tailUpperJoint.matrix.translate(0, 0.45, 0);
  tailUpperJoint.matrix.rotate(-g_tailUpperJointAngle, 1, 0, 0);
  tailUpperJoint.matrix.scale(0.1, 0.5, 0.1);
  tailUpperJoint.matrix.translate(0, 0, -0.5);
  tailUpperJoint.render();

  let duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration), "perfData");
}


sendTextToHTML = function(text, htmlID) {
  var htmlElement = document.getElementById(htmlID);
  if (!htmlElement) {
    console.log("Failed to get the element with id: " + htmlID);
    return;
  }
  htmlElement.innerHTML = text;
}
