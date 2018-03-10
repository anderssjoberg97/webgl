// @flow

export const vertexShaderSource = `
    // Will receive data from a buffer
    attribute vec4 a_position;
    // Will receive color data from a buffer
    attribute vec4 a_color;

    uniform mat4 u_matrix;

    varying vec4 v_color;

    void main() {
        // Multiply position with matrix
        vec4 position = u_matrix * a_position;
    }
`;
