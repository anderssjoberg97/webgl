// @flow
export function setGeometry(gl: WebGLRenderingContext){
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([
            -500, 0, 500,
            500, 0, 500,
            -500, 0, -500,
            -500, 0, -500,
            500, 0, 500,
            500, 0, -500,
        ]),
        gl.STATIC_DRAW
    );
}
