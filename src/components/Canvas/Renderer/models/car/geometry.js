// @flow
export function setGeometry(gl: WebGLRenderingContext){
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([
            // Front
            -1.3, 0, 0,
            1.3, 0, 0,
            -1.3, 3.2, 0,
            -1.3, 3.2, 0,
            1.3, 0, 500,
            500, 0, -500,
        ]),
        gl.STATIC_DRAW
    );
}
