// @flow

export const fragmentShaderSource = `
    // Set a precision
    precision mediump float;

    // Color input
    uniform vec4 u_color;

    void main() {
        // gl_FragColor must be set by fragment shader
        gl_FragColor = u_color;
    }
`;
