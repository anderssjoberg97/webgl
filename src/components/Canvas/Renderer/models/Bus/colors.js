// @flow
export const colors = new Uint8Array([
    // Front
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,


    // Back
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,

    // Right facing driving direction
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,

    // Left facing driving direction
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,

    // Roof
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,
    255,193,7,
]);
export function setColors(gl: WebGLRenderingContext){
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Uint8Array([
            // Front
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,


            // Back
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,

            // Right facing driving direction
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,

            // Left facing driving direction
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,

            // Roof
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,
            255,193,7,
        ]),
        gl.STATIC_DRAW
    );
}
