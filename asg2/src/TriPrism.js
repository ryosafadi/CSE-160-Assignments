class TriPrism {
    constructor() {
        this.type = 'triPrism';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }
}

function drawTriPrism(M, Color) {
    let rgba = Color;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

    drawTriangle3D([0, 0, 0,   1, 0, 0,   0.5, 1, 0]);

    gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
    drawTriangle3D([0, 0, 1,   1, 0, 1,   0.5, 1, 1]);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D([0, 0, 0,   1, 0, 0,   1, 0, 1]);
    drawTriangle3D([0, 0, 0,   1, 0, 1,   0, 0, 1]);

    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D([0, 0, 0,   0.5, 1, 0,   0.5, 1, 1]);
    drawTriangle3D([0, 0, 0,   0.5, 1, 1,   0, 0, 1]);

    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D([1, 0, 0,   0.5, 1, 0,   0.5, 1, 1]);
    drawTriangle3D([1, 0, 0,   0.5, 1, 1,   1, 0, 1]);
}
