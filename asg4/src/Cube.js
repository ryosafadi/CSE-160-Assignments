class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
    }

    render() {
        let rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front face (Z = 0)
        drawTriangle3DUVNormal([0, 0, 0,  1, 0, 0,  1, 1, 0], [0, 0,  1, 0,  1, 1], [0, 0, -1,  0, 0, -1,  0, 0, -1]);
        drawTriangle3DUVNormal([0, 0, 0,  1, 1, 0,  0, 1, 0], [0, 0,  1, 1,  0, 1], [0, 0, -1,  0, 0, -1,  0, 0, -1]);

        // Top face (Y = 1)
        //gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawTriangle3DUVNormal([0, 1, 0,  1, 1, 0,  1, 1, 1], [0, 0,  1, 0,  1, 1], [0, 1, 0,  0, 1, 0,  0, 1, 0]);
        drawTriangle3DUVNormal([0, 1, 0,  1, 1, 1,  0, 1, 1], [0, 0,  1, 1,  0, 1], [0, 1, 0,  0, 1, 0,  0, 1, 0]);

        // Left face (X = 0)
        //gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3DUVNormal([0, 0, 1,  0, 1, 1,  0, 1, 0], [0, 0,  1, 0,  1, 1], [-1, 0, 0,  -1, 0, 0,  -1, 0, 0]);
        drawTriangle3DUVNormal([0, 0, 1,  0, 1, 0,  0, 0, 0], [0, 0,  1, 1,  0, 1], [-1, 0, 0,  -1, 0, 0,  -1, 0, 0]);

        // Right face (X = 1)
        //gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        drawTriangle3DUVNormal([1, 0, 0,  1, 1, 0,  1, 1, 1], [0, 0,  1, 0,  1, 1], [1, 0, 0,  1, 0, 0,  1, 0, 0]);
        drawTriangle3DUVNormal([1, 0, 0,  1, 1, 1,  1, 0, 1], [0, 0,  1, 1,  0, 1], [1, 0, 0,  1, 0, 0,  1, 0, 0]);

        // Bottom face (Y = 0)
        //gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        drawTriangle3DUVNormal([0, 0, 0,  1, 0, 0,  1, 0, 1], [0, 0,  1, 0,  1, 1], [0, -1, 0,  0, -1, 0,  0, -1, 0]);
        drawTriangle3DUVNormal([0, 0, 0,  1, 0, 1,  0, 0, 1], [0, 0,  1, 1,  0, 1], [0, -1, 0,  0, -1, 0,  0, -1, 0]);

        // Back face (Z = 1)
        //gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
        drawTriangle3DUVNormal([0, 0, 1,  1, 0, 1,  1, 1, 1], [0, 0,  1, 0,  1, 1], [0, 0, 1,  0, 0, 1,  0, 0, 1]);
        drawTriangle3DUVNormal([0, 0, 1,  1, 1, 1,  0, 1, 1], [0, 0,  1, 1,  0, 1], [0, 0, 1,  0, 0, 1,  0, 0, 1]);
    }

    renderfast() {
        let rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts = [];

        allverts.push(0, 0, 0,  1, 0, 0,  1, 1, 0); // Front face (Z = 0)
        allverts.push(0, 0, 0,  1, 1, 0,  0, 1, 0);

        allverts.push(0, 1, 0,  1, 1, 0,  1, 1, 1); // Top face (Y = 1)
        allverts.push(0, 1, 0,  1, 1, 1,  0, 1, 1);

        allverts.push(0, 0, 1,  0, 1, 1,  0, 1, 0); // Left face (X = 0)
        allverts.push(0, 0, 1,  0, 1, 0,  0, 0, 0);

        allverts.push(1, 0, 0,  1, 1, 0,  1, 1, 1); // Right face (X = 1)
        allverts.push(1, 0, 0,  1, 1, 1,  1, 0, 1);

        allverts.push(0, 0, 0,  1, 0, 0,  1, 0, 1); // Bottom face (Y = 0)
        allverts.push(0, 0, 0,  1, 0, 1,  0, 0, 1);

        allverts.push(0, 0, 1,  1, 0, 1,  1, 1, 1); // Back face (Z = 1)
        allverts.push(0, 0, 1,  1, 1, 1,  0, 1, 1);

        drawTriangle3D(allverts);
    }

    renderfastUV() {
        let rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Arrays to store all vertices and UV coordinates
        var allVerts = [];
        var allUVs = [];

        // Front face (Z = 0)
        allVerts.push(0, 0, 0,  1, 0, 0,  1, 1, 0); 
        allVerts.push(0, 0, 0,  1, 1, 0,  0, 1, 0);
        allUVs.push(1, 0,  0, 0,  0, 1);
        allUVs.push(1, 0,  0, 1,  1, 1);

        // Top face (Y = 1)
        allVerts.push(0, 1, 0,  1, 1, 0,  1, 1, 1);
        allVerts.push(0, 1, 0,  1, 1, 1,  0, 1, 1);
        allUVs.push(1, 0,  0, 0,  0, 1);
        allUVs.push(1, 0,  0, 1,  1, 1);

        // Left face (X = 0)
        allVerts.push(0, 0, 1,  0, 1, 0,  0, 1, 1);
        allVerts.push(0, 0, 1,  0, 0, 0,  0, 1, 0);
        allUVs.push(1, 0,  0, 1,  1, 1);
        allUVs.push(1, 0,  0, 0,  0, 1);

        // Right face (X = 1)
        allVerts.push(1, 0, 0,  1, 1, 1,  1, 1, 0);
        allVerts.push(1, 0, 0,  1, 0, 1,  1, 1, 1);
        allUVs.push(1, 0,  0, 1,  1, 1);
        allUVs.push(1, 0,  0, 0,  0, 1);

        // Bottom face (Y = 0)
        allVerts.push(0, 0, 0,  1, 0, 0,  1, 0, 1);
        allVerts.push(0, 0, 0,  1, 0, 1,  0, 0, 1);
        allUVs.push(0, 0,  1, 0,  1, 1);
        allUVs.push(0, 0,  1, 1,  0, 1);

        // Back face (Z = 1)
        allVerts.push(0, 0, 1,  1, 0, 1,  1, 1, 1);
        allVerts.push(0, 0, 1,  1, 1, 1,  0, 1, 1);
        allUVs.push(0, 0,  1, 0,  1, 1);
        allUVs.push(0, 0,  1, 1,  0, 1);

        // Single draw call with all vertices and UVs
        drawTriangle3DUV(allVerts, allUVs);
    }

    renderShadowless() {
        let rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front face (Z = 0)
        drawTriangle3DUV([0, 0, 0,  1, 0, 0,  1, 1, 0], [0, 0,  1, 0,  1, 1]);
        drawTriangle3DUV([0, 0, 0,  1, 1, 0,  0, 1, 0], [0, 0,  1, 1,  0, 1]);

        // Top face (Y = 1)
        drawTriangle3DUV([0, 1, 0,  1, 1, 0,  1, 1, 1], [0, 0,  1, 0,  1, 1]);
        drawTriangle3DUV([0, 1, 0,  1, 1, 1,  0, 1, 1], [0, 0,  1, 1,  0, 1]);

        // Left face (X = 0)
        drawTriangle3DUV([0, 0, 1,  0, 1, 1,  0, 1, 0], [0, 0,  1, 0,  1, 1]);
        drawTriangle3DUV([0, 0, 1,  0, 1, 0,  0, 0, 0], [0, 0,  1, 1,  0, 1]);

        // Right face (X = 1)
        drawTriangle3DUV([1, 0, 0,  1, 1, 0,  1, 1, 1], [0, 0,  1, 0,  1, 1]);
        drawTriangle3DUV([1, 0, 0,  1, 1, 1,  1, 0, 1], [0, 0,  1, 1,  0, 1]);

        // Bottom face (Y = 0)
        drawTriangle3DUV([0, 0, 0,  1, 0, 0,  1, 0, 1], [0, 0,  1, 0,  1, 1]);
        drawTriangle3DUV([0, 0, 0,  1, 0, 1,  0, 0, 1], [0, 0,  1, 1,  0, 1]);

        // Back face (Z = 1)
        drawTriangle3DUV([0, 0, 1,  1, 0, 1,  1, 1, 1], [0, 0,  1, 0,  1, 1]);
        drawTriangle3DUV([0, 0, 1,  1, 1, 1,  0, 1, 1], [0, 0,  1, 1,  0, 1]);
    }
}

function drawCube(M, Color) {
    let rgba = Color;

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

    // Front face (Z = 0)
    drawTriangle3DUV([0, 0, 0,  1, 0, 0,  1, 1, 0], [0, 0,  1, 0,  1, 1]);
    drawTriangle3DUV([0, 0, 0,  1, 1, 0,  0, 1, 0], [0, 0,  1, 1,  0, 1]);

    // Top face (Y = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3DUV([0, 1, 0,  1, 1, 0,  1, 1, 1], [0, 0,  1, 0,  1, 1]);
    drawTriangle3DUV([0, 1, 0,  1, 1, 1,  0, 1, 1], [0, 0,  1, 1,  0, 1]);

    // Left face (X = 0)
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3DUV([0, 0, 1,  0, 1, 1,  0, 1, 0], [0, 0,  1, 0,  1, 1]);
    drawTriangle3DUV([0, 0, 1,  0, 1, 0,  0, 0, 0], [0, 0,  1, 1,  0, 1]);

    // Right face (X = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3DUV([1, 0, 0,  1, 1, 0,  1, 1, 1], [0, 0,  1, 0,  1, 1]);
    drawTriangle3DUV([1, 0, 0,  1, 1, 1,  1, 0, 1], [0, 0,  1, 1,  0, 1]);

    // Bottom face (Y = 0)
    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    drawTriangle3DUV([0, 0, 0,  1, 0, 0,  1, 0, 1], [0, 0,  1, 0,  1, 1]);
    drawTriangle3DUV([0, 0, 0,  1, 0, 1,  0, 0, 1], [0, 0,  1, 1,  0, 1]);

    // Back face (Z = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
    drawTriangle3DUV([0, 0, 1,  1, 0, 1,  1, 1, 1], [0, 0,  1, 0,  1, 1]);
    drawTriangle3DUV([0, 0, 1,  1, 1, 1,  0, 1, 1], [0, 0,  1, 1,  0, 1]);
}