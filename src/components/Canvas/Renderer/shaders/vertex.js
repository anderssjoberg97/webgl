// @flow

export const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;

    uniform mat4 u_matrix;

    varying vec4 v_color;

    void main() {
        // Multiply position with matrix
        gl_Position = u_matrix * a_position;

        v_color = a_color;
    }
`;
