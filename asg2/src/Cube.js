class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        let rgba = this.color;
    
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        // Front face (Z = 0)
        drawTriangle3D([0, 0, 0,  1, 0, 0,  1, 1, 0]);
        drawTriangle3D([0, 0, 0,  1, 1, 0,  0, 1, 0]);
    
        // Top face (Y = 1)
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawTriangle3D([0, 1, 0,  1, 1, 0,  1, 1, 1]);
        drawTriangle3D([0, 1, 0,  1, 1, 1,  0, 1, 1]);
    
        // Left face (X = 0)
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D([0, 0, 1,  0, 1, 1,  0, 1, 0]);
        drawTriangle3D([0, 0, 1,  0, 1, 0,  0, 0, 0]);
    
        // Right face (X = 1)
        gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        drawTriangle3D([1, 0, 0,  1, 1, 0,  1, 1, 1]);
        drawTriangle3D([1, 0, 0,  1, 1, 1,  1, 0, 1]);
    
        // Bottom face (Y = 0)
        gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        drawTriangle3D([0, 0, 0,  1, 0, 0,  1, 0, 1]);
        drawTriangle3D([0, 0, 0,  1, 0, 1,  0, 0, 1]);
    
        // Back face (Z = 1)
        gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
        drawTriangle3D([0, 0, 1,  1, 0, 1,  1, 1, 1]);
        drawTriangle3D([0, 0, 1,  1, 1, 1,  0, 1, 1]);
    }
}

function drawCube(M, Color) {
    let rgba = Color;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

    // Front face (Z = 0)
    drawTriangle3D([0, 0, 0,  1, 0, 0,  1, 1, 0]);
    drawTriangle3D([0, 0, 0,  1, 1, 0,  0, 1, 0]);

    // Top face (Y = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D([0, 1, 0,  1, 1, 0,  1, 1, 1]);
    drawTriangle3D([0, 1, 0,  1, 1, 1,  0, 1, 1]);

    // Left face (X = 0)
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D([0, 0, 1,  0, 1, 1,  0, 1, 0]);
    drawTriangle3D([0, 0, 1,  0, 1, 0,  0, 0, 0]);

    // Right face (X = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D([1, 0, 0,  1, 1, 0,  1, 1, 1]);
    drawTriangle3D([1, 0, 0,  1, 1, 1,  1, 0, 1]);

    // Bottom face (Y = 0)
    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    drawTriangle3D([0, 0, 0,  1, 0, 0,  1, 0, 1]);
    drawTriangle3D([0, 0, 0,  1, 0, 1,  0, 0, 1]);

    // Back face (Z = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
    drawTriangle3D([0, 0, 1,  1, 0, 1,  1, 1, 1]);
    drawTriangle3D([0, 0, 1,  1, 1, 1,  0, 1, 1]);
}