// @flow

export function setColors(gl: WebGLRenderingContext){
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Uint8Array([
            150, 150, 150,
            150, 150, 150,
            150, 150, 150,
            150, 150, 150,
            150, 150, 150,
            150, 150, 150,

        ]),
        gl.STATIC_DRAW
    );
}
