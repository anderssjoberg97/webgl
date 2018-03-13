// @flow

import {mat4} from 'gl-matrix';
import type {Mat4} from 'gl-matrix';

import {compileShader, createShaderProgram, randomInt} from './helpers';
import {vertexShaderSource} from './shaders/vertex';
import {fragmentShaderSource} from './shaders/fragment';

import {setGeometry, setColors} from './models/letter/';
import {setGeometry as setFloorGeometry, setColors as setFloorColors} from './models/floor/';
import {matrices} from './matrices';

import Bus from './models/Bus/Bus';

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
    programInfo: ProgramInfo;
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;

    translation = [-100, 0, -360];
    rotation = [ 0 * Math.PI, 0 * Math.PI, 0 * Math.PI];
    scale = [1, 1, 1];
    color = [Math.random(), Math.random(), Math.random(), 4];
    fieldOfView = 60 * Math.PI / 180 ;
    cameraAngle = 0.1 * Math.PI;
    numFs = 10;
    radius = 500;

    constructor(){
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

        // Create a buffer for position data and upload to it
        const positionBuffer = gl.createBuffer();

        // Create a buffer for color data and upload to it
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

        // Use recently set up program
        this.gl.useProgram(this.programInfo.program);

        // Compute projection matrix
        let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        let zNear = 1;
        let zFar = 3000;
        let projectionMatrix = matrices.perspective(this.fieldOfView, aspect, zNear, zFar);

        // Compute camera matrix
        let cameraMatrix = matrices.yRotation(this.cameraAngle);
        matrices.translate(cameraMatrix, 0, this.radius * 1, this.radius * 2);
        mat4.rotateX(cameraMatrix, cameraMatrix, -0.4);


        // Compute viewmatrix
        let viewMatrix: Mat4 = mat4.create();
        mat4.invert(viewMatrix, cameraMatrix);

        let viewProjectionMatrix = mat4.create();
        mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

        /* =============== Draw bus ================== */
        // Turn on the vertex attribute
        this.gl.enableVertexAttribArray(this.programInfo.attributeLocations.position);
        // Bind the position buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.programInfo.buffers.position);
        // Upload data
        Bus.uploadGeometry(this.gl);
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
        // Upload data
        Bus.uploadColors(this.gl);
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

        // Do actual drawing of floor
        {
            let matrix = mat4.clone(viewProjectionMatrix);
            matrices.translate(matrix, 0, 0, 0);

            this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.matrix, false, (matrix: any));

            // Draw geometry
            const primitiveType = this.gl.TRIANGLES;
            const offset = 0;
            const count = 6  * 5;
            this.gl.drawArrays(primitiveType, offset, count);
        }

        /* =============== Draw floor ================== */
        // Turn on the vertex attribute
        this.gl.enableVertexAttribArray(this.programInfo.attributeLocations.position);
        // Bind the position buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.programInfo.buffers.position);
        // Upload data
        setFloorGeometry(this.gl);
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
        // Upload data
        setFloorColors(this.gl);
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

        // Do actual drawing of floor
        {
            let matrix = mat4.clone(viewProjectionMatrix);
            matrices.translate(matrix, 0, 0, 0);

            this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.matrix, false, (matrix: any));

            // Draw geometry
            const primitiveType = this.gl.TRIANGLES;
            const offset = 0;
            const count = 3  * 2;
            this.gl.drawArrays(primitiveType, offset, count);
        }
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
