// @flow

export const fragmentShaderSource = `
    // Set a precision
    precision mediump float;

    // Color input
    varying vec4 v_color;

    void main() {
        // gl_FragColor must be set by fragment shader
        gl_FragColor = v_color;
    }
`;
