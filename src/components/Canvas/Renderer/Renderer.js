// @flow

import {mat4} from 'gl-matrix';
import type {Mat4} from 'gl-matrix';

import {fragmentShaderSource} from './shaders/fragment';
import {vertexShaderSource} from './shaders/vertex';

import {createShaderProgram} from './helpers';

import {matrices} from './matrices';

import {setColors, setGeometry} from './models/letter/index';


type ProgramInfo = {
    program: WebGLProgram,
    attributeLocations: {
        position: number,
        color: number,
    },
    uniformLocations: {
        matrix: WebGLUniformLocation,
    },
    buffers: {
        position: WebGLBuffer,
        color: WebGLBuffer,
    }
};

export default class Renderer {
    gl: WebGLRenderingContext;
    canvas: HTMLCanvasElement;
    programInfo: ProgramInfo;

    translation = [-100, 0, -360];
    rotation = [ 0 * Math.PI, 0 * Math.PI, 0 * Math.PI];
    scale = [1, 1, 1];
    color = [Math.random(), Math.random(), Math.random(), 4];
    fieldOfView = 60 * Math.PI / 180;
    cameraAngle = 0.1 * Math.PI;
    radius = 200;
    numFs = 5;

    /**
     * Initializes a WebGL context
     */
    constructor() {
        // Bind class methods
        this.startRendering = this.startRendering.bind(this);
        // Get GL context
        const canvas = document.querySelector('.Canvas');
        if(!(canvas instanceof HTMLCanvasElement)){
            console.log('Could not find canvas');
            return;
        }
        const gl = canvas.getContext('webgl');
        if(!gl){
            return;
        }

        // Create shader program
        const shaderProgram = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
        if(shaderProgram == null){
            console.log('Could not create shader program');
            return;
        }

        // Look up attribute locations
        const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');
        if(positionAttributeLocation === -1){
            console.log('Could not get position attribute');
        }
        const colorAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_color');

        // Look up uniforms
        const matrixUniformLocation = gl.getUniformLocation(shaderProgram, 'u_matrix');

        // Create a buffer for position data
        const positionBuffer = gl.createBuffer();

        // Create a buffer for color data
        const colorBuffer = gl.createBuffer();




        // Set fields
        this.gl = gl;
        this.canvas = canvas;
        this.programInfo = {
            program: shaderProgram,
            attributeLocations: {
                position: positionAttributeLocation,
                color: colorAttributeLocation,
            }, uniformLocations: {
                matrix: matrixUniformLocation,
            }, buffers: {
                position: positionBuffer,
                color: colorBuffer,
            }
        };
    }

    /**
     * Starts a render process
     */
    startRendering: () => void;
    startRendering(): void{
        let then = 0;
        function render(now: number): void {

            const deltaTime = now - then;
            then = now;

            this.draw(deltaTime);
            this.update(deltaTime);
            requestAnimationFrame(render);
        }

        render = render.bind(this);

        requestAnimationFrame(render);
    }

    /**
     * Draws a frame
     * @param {number} deltaTime    Time passed since last frame was drawn
     */
    draw(deltaTime: number): void {
        // Update canvas size
        this.resizeCanvas();

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        // Clear canvas and depth buffer
        this.gl.clearColor(1, 1, 1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Turn on culling
        this.gl.enable(this.gl.CULL_FACE);

        // Enable depth buffer
        this.gl.enable(this.gl.DEPTH_TEST);

        // Use program set up in constructor
        this.gl.useProgram(this.programInfo.program);

        // Compute matrices and set matrix uniform
        let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        let zNear = 1;
        let zFar = 2000;
        let projectionMatrix = matrices.perspective(this.fieldOfView, aspect, zNear, zFar);

        // Compute camera matrix
        let cameraMatrix = matrices.yRotation(this.cameraAngle);
        matrices.translate(cameraMatrix, 0, 0, this.radius * 1.5);

        // Compute viewmatrix
        let viewMatrix = mat4.create();
        mat4.invert(viewMatrix, cameraMatrix);

        // Compute view projection matrix
        let viewProjectionMatrix = mat4.create();
        mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

        // Turn on the vertex attribute
        this.gl.enableVertexAttribArray(this.programInfo.attributeLocations.position);
        // Bind the position buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.programInfo.buffers.position);
        // Load in geometry
        setGeometry(this.gl);
        // Tell the attribute how to get data out of positionbuffer
        {
            const size = 3;             // 3 components per iteration
            const type = this.gl.FLOAT;      // Data is of type 32bit float
            const normalize = false;    // Don't normalize the data
            const stride = 0;           // Move forward regurlarly no skipping
            const offset = 0;           // Start at the beginning of buffer
            this.gl.vertexAttribPointer(this.programInfo.attributeLocations.position,
                size,
                type,
                normalize,
                stride,
                offset
            );
        }

        // Turn on the color attribute
        this.gl.enableVertexAttribArray(this.programInfo.attributeLocations.color);
        // Bind the color buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.programInfo.buffers.color);
        // Load in colors
        setColors(this.gl);
        // Tell WebGL how to get data out of color buffer
        {
            const size = 3;
            const type = this.gl.UNSIGNED_BYTE;
            const normalize = true;
            const stride = 0;
            const offset = 0;
            this.gl.vertexAttribPointer(this.programInfo.attributeLocations.color,
                size,
                type,
                normalize,
                stride,
                offset,
            );
        }

        // Draw geometry
        const primitiveType = this.gl.TRIANGLES;
        const offset = 0;
        const count = 16 * 6;
        this.gl.drawArrays(primitiveType, offset, count);
    }

    /**
     * Updates the scene
     * @param {number} deltaTime    Time passed since last frame was drawn
     */
    update(deltaTime: number): void{
        this.rotation[0] += deltaTime * 0.001;
        this.rotation[1] += deltaTime * 0.0007;
    }

    /**
     * Resizes a canvas to CSS display size
     * @return {bool} True if canvas was resized
     */
    resizeCanvas(): bool {
        let width = this.canvas.clientWidth | 0;
        let height = this.canvas.clientHeight | 0;
        if(this.canvas.width !== width || this.canvas.height !== height){
            this.canvas.width = width;
            this.canvas.height = height;
            return true;
        }
        return false

    }
}
