// @flow

/**
 * Creates a WebGL shader program
 * @param  {WebGLRenderingContext} gl    WebGL context
 * @param  {string} vertexShaderSource   Vertex shader source code
 * @param  {string} fragmentShaderSource Fragment shader source code
 * @return {WebGLProgram}                The WebGL shader program
 */
export function createShaderProgram(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string): ?WebGLProgram {
    // Create shaders
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if(vertexShader == null || fragmentShader == null) {
        console.log('Error loading shaders');
        return null;
    }

    // Create shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // Error logging
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log('Could not link shader program: ', gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;

}

/**
 * Creates a shader, uploads source and compiles it
 * @param  {WebGLRenderingContext} gl       WebGL context
 * @param  {number} type                    Shader type
 * @param  {string} source                  Shader source code
 * @return {WebGLShader}                    Compiled shader
 */
export function compileShader(gl: WebGLRenderingContext, type: number, source: string): ?WebGLShader {
    // Create a shader
    const shader = gl.createShader(type);

    // Upload source
    gl.shaderSource(shader, source);

    // Compile the shader
    gl.compileShader(shader);

    // Error logging
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        let infoLog = gl.getShaderInfoLog(shader);
        if(infoLog != null) {
            console.log('Could not compile shader: ', infoLog);
        }
        gl.deleteShader(shader);
        return null;
    }

    return shader;

}

/**
 * Returns a random number 0 -> cap - 1
 * @param {number} cap Max cap
 * @return {number} A random number
 */
export function randomInt(cap: number): number{
    return Math.floor(Math.random() * cap);
}
