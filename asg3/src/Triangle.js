class Triangle {
    constructor() {
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }
}

function drawTriangle(vertices) {
    var n = 3;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_vertexBuffer = null;
var g_uvBuffer = null;

// Calculate how many vertices we need for a cube (12 triangles × 3 vertices)
const CUBE_VERTICES = 12 * 3; // 36 vertices for a complete cube
const MAX_VERTICES = CUBE_VERTICES * 2; // Add some extra space just to be safe

function initTriangle3D() {
    // Create and set up vertex buffer
    g_vertexBuffer = gl.createBuffer();
    if (!g_vertexBuffer) {
        console.log('Failed to create the vertex buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    
    // Calculate exact buffer size needed (3 floats per vertex)
    const bufferSizeBytes = Float32Array.BYTES_PER_ELEMENT * MAX_VERTICES * 3;
    
    // Allocate the buffer
    gl.bufferData(gl.ARRAY_BUFFER, bufferSizeBytes, gl.DYNAMIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    // Create and set up UV buffer (2 floats per vertex)
    g_uvBuffer = gl.createBuffer();
    if (!g_uvBuffer) {
        console.log('Failed to create the UV buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
    
    const uvBufferSizeBytes = Float32Array.BYTES_PER_ELEMENT * MAX_VERTICES * 2;
    gl.bufferData(gl.ARRAY_BUFFER, uvBufferSizeBytes, gl.DYNAMIC_DRAW);
    
    return 0;
}

function drawTriangle3D(vertices) {
    var n = vertices.length / 3;
    
    // Check if we're exceeding the buffer capacity
    if (n > MAX_VERTICES) {
        console.error("Error: Trying to draw " + n + " vertices, but buffer capacity is only " + MAX_VERTICES);
        // Consider splitting the draw call or increasing MAX_VERTICES
        return;
    }
    
    // Initialize buffers if needed
    if (g_vertexBuffer == null) {
        if (initTriangle3D() < 0) return;
    }
    
    // Bind and update vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    
    // Calculate byte size of data
    const dataSize = vertices.length * Float32Array.BYTES_PER_ELEMENT;
    
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
    
    // Set up vertex attribute
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {
    var n = vertices.length / 3;
    
    // Initialize buffers if needed
    if (g_vertexBuffer == null) {
        if (initTriangle3D() < 0) return;
    }
    
    // Bind and update vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
    
    // Set up vertex attribute
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    // Bind and update UV buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(uv));
    
    // Set up UV attribute
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);
    
    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, n);
}