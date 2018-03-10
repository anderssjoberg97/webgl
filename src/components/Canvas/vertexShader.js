// @flow

export const vertexShaderSource = `
    // Will receive data from a buffer
    attribute vec4 a_position;
    // Will receive color data from a buffer
    attribute vec4 a_color;

    uniform mat4 u_matrix;
    // Adjusts the Z to divide by
    uniform float u_fudgeFactor;

    varying vec4 v_color;

    void main() {
        // Multiply position with matrix
        vec4 position = u_matrix * a_position;

        // Adjust Z to divide by
        float zToDivideBy = 1.0 + position.z * u_fudgeFactor;

        // Divide X and Y by Z
        gl_Position = vec4(position.xyz, zToDivideBy);

        // Pass color to fragment shader
        v_color = a_color;
    }
`;
