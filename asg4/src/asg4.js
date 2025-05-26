// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }
`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform bool u_LightOn;
  uniform vec3 u_LightPos;
  uniform vec3 u_CameraPos;
  uniform vec3 u_LightColor;

  // Spotlight uniforms
  uniform bool u_SpotLightOn;
  uniform vec3 u_SpotLightPos;
  uniform vec3 u_SpotLightDirection;
  uniform float u_SpotLightCutoff;
  uniform vec3 u_SpotLightColor;

  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      gl_FragColor = u_FragColor;
    } else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
    }

    // Point Light Calculation
    vec3 lightVector = u_LightPos - vec3(v_VertPos);
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);
    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_CameraPos - vec3(v_VertPos));
    float specularIntensity = pow(max(dot(R, E), 0.0), 10.0);
    vec3 specular = specularIntensity * u_LightColor;
    vec3 diffuse = vec3(gl_FragColor) * nDotL * u_LightColor;
    vec3 ambient = vec3(gl_FragColor) * 0.3 * u_LightColor;
    vec3 pointLightEffect = vec3(0.0);
    if (u_LightOn) {
      if (u_whichTexture == 3) {
        pointLightEffect = specular + diffuse + ambient;
      } else {
        pointLightEffect = diffuse + ambient;
      }
    }

    // Spotlight Calculation
    vec3 spotLightVector = u_SpotLightPos - vec3(v_VertPos);
    vec3 spotLightDirectionNorm = normalize(u_SpotLightDirection);
    vec3 spotL = normalize(spotLightVector);
    float angle = dot(-spotL, spotLightDirectionNorm);

    vec3 spotSpecular = vec3(0.0);
    vec3 spotDiffuse = vec3(0.0);
    vec3 spotAmbient = vec3(gl_FragColor) * 0.1 * u_SpotLightColor; // A smaller ambient for spotlight

    if (u_SpotLightOn && angle > u_SpotLightCutoff) {
      float spotFactor = smoothstep(u_SpotLightCutoff, u_SpotLightCutoff + 0.01, angle); // Soft edge

      // Diffuse
      float spotNDotL = max(dot(N, spotL), 0.0);
      spotDiffuse = vec3(gl_FragColor) * spotNDotL * u_SpotLightColor * spotFactor;

      // Specular
      vec3 spotR = reflect(-spotL, N);
      float spotSpecularIntensity = pow(max(dot(spotR, E), 0.0), 20.0);
      spotSpecular = spotSpecularIntensity * u_SpotLightColor * spotFactor;
    }

    vec3 finalColor = ambient + pointLightEffect + spotAmbient + spotDiffuse + spotSpecular;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_LightPos;
let u_CameraPos;
let u_LightOn;
let u_LightColor;
let u_SpotLightOn;
let u_SpotLightPos;
let u_SpotLightDirection;
let u_SpotLightCutoff;
let u_SpotLightColor;

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
let g_animation = false;
let g_normalOn = false;
let g_lightPos = [0, 1, -2];
let g_lightColor = [1.0, 1.0, 1.0];
let g_lightOn = true;
let g_lightAnimOn = true;
let g_spotLightOn = true;
let g_spotLightPos = [2, 0, 2];
let g_spotLightDirection = normalize([ -1, -1, -1 ]); // Pointing downwards and slightly to the side
let g_spotLightCutoff = Math.cos(Math.PI / 6); // 30-degree cutoff (inner angle)
let g_spotLightColor = [1.0, 1.0, 0.0]; // Yellow

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
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
  if (!u_LightPos) {
    console.log('Failed to get the storage location of u_LightPos');
    return;
  }
  u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
  if (!u_CameraPos) {
    console.log('Failed to get the storage location of u_CameraPos');
    return;
  }
  u_LightOn = gl.getUniformLocation(gl.program, 'u_LightOn');
  if (!u_LightOn) {
    console.log('Failed to get the storage location of u_LightOn');
    return;
  }
  u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  if (!u_LightColor) {
    console.log('Failed to get the storage location of u_LightColor');
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

  // Spotlight Uniforms
  u_SpotLightOn = gl.getUniformLocation(gl.program, 'u_SpotLightOn');
  if (!u_SpotLightOn) {
    console.log('Failed to get the storage location of u_SpotLightOn');
    return;
  }
  u_SpotLightPos = gl.getUniformLocation(gl.program, 'u_SpotLightPos');
  if (!u_SpotLightPos) {
    console.log('Failed to get the storage location of u_SpotLightPos');
    return;
  }
  u_SpotLightDirection = gl.getUniformLocation(gl.program, 'u_SpotLightDirection');
  if (!u_SpotLightDirection) {
    console.log('Failed to get the storage location of u_SpotLightDirection');
    return;
  }
  u_SpotLightCutoff = gl.getUniformLocation(gl.program, 'u_SpotLightCutoff');
  if (!u_SpotLightCutoff) {
    console.log('Failed to get the storage location of u_SpotLightCutoff');
    return;
  }
  u_SpotLightColor = gl.getUniformLocation(gl.program, 'u_SpotLightColor');
  if (!u_SpotLightColor) {
    console.log('Failed to get the storage location of u_SpotLightColor');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmlUI() {
  canvas.addEventListener("click", () => { canvas.requestPointerLock(); });
  document.getElementById("normalOn").onclick = function() { g_normalOn = true; };
  document.getElementById("normalOff").onclick = function() { g_normalOn = false; };
  document.getElementById("pointLightOn").onclick = function() { g_lightOn = true; renderScene(); };
  document.getElementById("pointLightOff").onclick = function() { g_lightOn = false; renderScene(); };
  document.getElementById("spotLightOn").onclick = function() { g_spotLightOn = true; renderScene(); };
  document.getElementById("spotLightOff").onclick = function() { g_spotLightOn = false; renderScene(); };
  document.getElementById("lightAnimOn").onclick = function() { g_lightAnimOn = true; renderScene(); };
  document.getElementById("lightAnimOff").onclick = function() { g_lightAnimOn = false; renderScene(); };
  document.getElementById("lightX").addEventListener("input", function() { g_lightPos[0] = this.value / 100; renderScene(); });
  document.getElementById("lightY").addEventListener("input", function() { g_lightPos[1] = this.value / 100; renderScene(); });
  document.getElementById("lightZ").addEventListener("input", function() { g_lightPos[2] = this.value / 100; renderScene(); });
  document.getElementById("redSlide").addEventListener("input", function() { g_lightColor[0] = this.value / 100; renderScene(); });
  document.getElementById("greenSlide").addEventListener("input", function() { g_lightColor[1] = this.value / 100; renderScene(); });
  document.getElementById("blueSlide").addEventListener("input", function() { g_lightColor[2] = this.value / 100; renderScene(); });

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
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_lightAnimOn == true) g_lightPos[0] = Math.cos(g_seconds) * 2.0;
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

function normalize(v) {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (length > 0) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
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

  //drawMap();

  gl.uniform3f(u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_CameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  gl.uniform1i(u_LightOn, g_lightOn);
  gl.uniform3f(u_LightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);

  // Set spotlight uniforms
  gl.uniform1i(u_SpotLightOn, g_spotLightOn);
  gl.uniform3f(u_SpotLightPos, g_spotLightPos[0], g_spotLightPos[1], g_spotLightPos[2]);
  gl.uniform3f(u_SpotLightDirection, g_spotLightDirection[0], g_spotLightDirection[1], g_spotLightDirection[2]);
  gl.uniform1f(u_SpotLightCutoff, g_spotLightCutoff);
  gl.uniform3f(u_SpotLightColor, g_spotLightColor[0], g_spotLightColor[1], g_spotLightColor[2]);

  // Draw spotlight representation
  var spotLightCube = new Cube();
  spotLightCube.color = [g_spotLightColor[0], g_spotLightColor[1], g_spotLightColor[2], 1.0];
  spotLightCube.matrix.setTranslate(g_spotLightPos[0], g_spotLightPos[1], g_spotLightPos[2]);
  spotLightCube.matrix.scale(-0.2, -0.2, -0.2);
  spotLightCube.matrix.translate(-0.5, -0.5, -0.5);
  spotLightCube.render();

  var light = new Cube();
  light.color = [1, 1, 1, 1];
  light.matrix.setTranslate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.2, -0.2, -0.2);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();

  let sky = new Cube();
  sky.color = [0.25, 0.65, 0.9, 1.0];
  if (g_normalOn) sky.textureNum = -3;
  sky.matrix.scale(-10, -10, -10);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  let sphere = new Sphere();
  sphere.textureNum = 3;
  if (g_normalOn) sphere.textureNum = -3;
  sphere.matrix.setTranslate(-2, -2, 0);
  sphere.render();

  /*
  let floor = new Cube();
  floor.color = [0.0, 1.0, 0.0, 1.0];
  floor.matrix.setTranslate(0, -0.75, 0);
  floor.matrix.scale(32, 0, 32);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.renderShadowless();
  */

  let body = new Cube();
  body.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) body.textureNum = -3;
  body.matrix.setTranslate(1, -3, 0);
  body.matrix.rotate(0, 0, 1, 0);
  let bodyMatrix = new Matrix4(body.matrix);
  body.matrix.scale(1.5, 0.5, 0.5);
  body.render();

  let head = new Cube();
  head.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) head.textureNum = -3;
  head.matrix.set(bodyMatrix);
  head.matrix.translate(1.25, 0.35, -0.05);
  head.matrix.rotate(-g_headAngle, 0, 0, 1);
  head.matrix.scale(0.6, 0.6, 0.6);
  head.render();

  let rightEar = new Cube();
  rightEar.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) rightEar.textureNum = -3;
  rightEar.matrix.set(head.matrix);
  rightEar.matrix.translate(0, 1, 0);
  rightEar.matrix.scale(0.4, 0.4, 0.3);
  rightEar.render();

  let leftEar = new Cube();
  leftEar.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) leftEar.textureNum = -3;
  leftEar.matrix.set(head.matrix);
  leftEar.matrix.translate(0, 1, 0.7);
  leftEar.matrix.scale(0.4, 0.4, 0.3);
  leftEar.render();

  let rightInnerEar = new Cube();
  rightInnerEar.color = [0.95, 0.58, 0.91, 1.0];
  if (g_normalOn) rightInnerEar.textureNum = -3;
  rightInnerEar.matrix.set(rightEar.matrix);
  rightInnerEar.matrix.translate(0.18, 0.1, 0.1);
  rightInnerEar.matrix.scale(0.8, 0.8, 0.8);
  rightInnerEar.render();

  let leftInnerEar = new Cube();
  leftInnerEar.color = [0.95, 0.58, 0.91, 1.0];
  if (g_normalOn) leftInnerEar.textureNum = -3;
  leftInnerEar.matrix.set(leftEar.matrix);
  leftInnerEar.matrix.translate(0.18, 0.1, 0.1);
  leftInnerEar.matrix.scale(0.8, 0.8, 0.8);
  leftInnerEar.render();

  let rightEye = new Cube();
  rightEye.color = [0.12, 0.6, 0.23, 1.0];
  if (g_normalOn) rightEye.textureNum = -3;
  rightEye.matrix.set(head.matrix);
  rightEye.matrix.translate(0.72, 0.5, 0.125);
  rightEye.matrix.scale(0.3, 0.3, 0.3);
  rightEye.render();

  let leftEye = new Cube();
  leftEye.color = [0.12, 0.6, 0.23, 1.0];
  if (g_normalOn) leftEye.textureNum = -3;
  leftEye.matrix.set(head.matrix);
  leftEye.matrix.translate(0.72, 0.5, 0.575);
  leftEye.matrix.scale(0.3, 0.3, 0.3);
  leftEye.render();

  let rightPupil = new Cube();
  rightPupil.color = [0.0, 0.0, 0.0, 1.0];
  if (g_normalOn) rightPupil.textureNum = -3;
  rightPupil.matrix.set(rightEye.matrix);
  rightPupil.matrix.translate(0.61, 0.3 - g_dilationFactor * 0.5, 0.3 - g_dilationFactor * 0.5);
  rightPupil.matrix.scale(0.4, 0.4 + g_dilationFactor, 0.4 + g_dilationFactor);
  rightPupil.render();

  let leftPupil = new Cube();
  leftPupil.color = [0.0, 0.0, 0.0, 1.0];
  if (g_normalOn) leftPupil.textureNum = -3;
  leftPupil.matrix.set(leftEye.matrix);
  leftPupil.matrix.translate(0.61, 0.3 - g_dilationFactor * 0.5, 0.3 - g_dilationFactor * 0.5);
  leftPupil.matrix.scale(0.4, 0.4 + g_dilationFactor, 0.4 + g_dilationFactor);
  leftPupil.render();

  let rightFrontLeg = new Cube();
  rightFrontLeg.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) rightFrontLeg.textureNum = -3;
  rightFrontLeg.matrix.set(bodyMatrix);
  rightFrontLeg.matrix.translate(1.25, -0.7, 0.0);
  rightFrontLeg.matrix.rotate(g_rightFrontLegAngle, 0, 0, 1);
  rightFrontLeg.matrix.scale(0.25, 0.7, 0.15);
  rightFrontLeg.render();

  let leftFrontLeg = new Cube();
  leftFrontLeg.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) leftFrontLeg.textureNum = -3;
  leftFrontLeg.matrix.set(bodyMatrix);
  leftFrontLeg.matrix.translate(1.25, -0.7, 0.35);
  leftFrontLeg.matrix.rotate(g_leftFrontLegAngle, 0, 0, 1);
  leftFrontLeg.matrix.scale(0.25, 0.7, 0.15);
  leftFrontLeg.render();

  let rightBackLeg = new Cube();
  rightBackLeg.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) rightBackLeg.textureNum = -3;
  rightBackLeg.matrix.set(bodyMatrix);
  rightBackLeg.matrix.translate(0, -0.7, 0.0);
  rightBackLeg.matrix.rotate(g_rightBackLegAngle, 0, 0, 1);
  rightBackLeg.matrix.scale(0.25, 0.7, 0.15);
  rightBackLeg.render();

  let leftBackLeg = new Cube();
  leftBackLeg.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) leftBackLeg.textureNum = -3;
  leftBackLeg.matrix.set(bodyMatrix);
  leftBackLeg.matrix.translate(0, -0.7, 0.35);
  leftBackLeg.matrix.rotate(g_leftBackLegAngle, 0, 0, 1);
  leftBackLeg.matrix.scale(0.25, 0.7, 0.15);
  leftBackLeg.render();

  let tailBase = new Cube();
  tailBase.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) tailBase.textureNum = -3;
  tailBase.matrix.set(bodyMatrix);
  tailBase.matrix.translate(0, 0.35, 0.175);
  tailBase.matrix.rotate(-g_tailBaseAngleZ, 0, 0, 1);
  tailBase.matrix.rotate(-g_tailBaseAngleX, 1, 0, 0);
  let tailBaseMatrix = new Matrix4(tailBase.matrix);
  tailBase.matrix.scale(0.1, 0.5, 0.1);
  tailBase.render();

  let tailLowerJoint = new Cube();
  tailLowerJoint.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) tailLowerJoint.textureNum = -3;
  tailLowerJoint.matrix.set(tailBaseMatrix);
  tailLowerJoint.matrix.translate(0, 0.45, 0.05);
  tailLowerJoint.matrix.rotate(-g_tailLowerJointAngle, 1, 0, 0);
  let tailLowerJointMatrix = new Matrix4(tailLowerJoint.matrix);
  tailLowerJoint.matrix.scale(0.1, 0.5, 0.1);
  tailLowerJoint.matrix.translate(0, 0, -0.5);
  tailLowerJoint.render();

  let tailUpperJoint = new Cube();
  tailUpperJoint.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) tailUpperJoint.textureNum = -3;
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
