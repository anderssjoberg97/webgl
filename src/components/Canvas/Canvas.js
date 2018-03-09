// @flow
import React, { Component } from 'react';
import {mat4} from 'gl-matrix';

import {compileShader, createShaderProgram} from './helpers';
import {vertexShaderSource} from './vertexShader';
import {fragmentShaderSource} from './fragmentShader';
import './Canvas.css';

type ProgramInfo = {
    program: WebGLProgram,
    attribLocations: {
        vertexPosition: number,
        vertexColor: number,
    },
    uniformLocations: {
        projectionMatrix: WebGLUniformLocation,
        modelViewMatrix: WebGLUniformLocation
    }
}

type BufferContainer = {
    position: WebGLBuffer,
    color: WebGLBuffer,
    indices: WebGLBuffer,
}



type Props = {

}
export default class Canvas extends Component<Props> {

    // When last frame was rendered
    then = 0;
    // Current rotation
    rotation = 0.0;

    constructor(){
        super();

        this.initializeGl = this.initializeGl.bind(this);
        this.initializeBuffers = this.initializeBuffers.bind(this);
    }
    componentDidMount(){
        this.initializeGl();
    }


    render() {
        return (<canvas className={'Canvas'} width={800} height={600}></canvas>);
    }

    /**
     * Iniitializes a WebGL shader program
     * @param  {WebGLRenderingContext} gl   WebGL context
     * @param  {ProgramInfo} programInfo    Vertex shader source code
     * @param  {BufferContainer} buffers    Fragment shader source code
     * @param  {number}                     Time passed since last frame
     */
    drawScene: (gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: BufferContainer, deltaTime: number) => void;
    drawScene(gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: BufferContainer, deltaTime: number): void {
        // Set up clearing
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);

        // Enable depth testing
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Clear canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set up a projection matrix
        const fieldOfView = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar
        );

        // Set the drawing posiiton to center
        const modelViewMatrix = mat4.create();

        // Move square
        mat4.translate(modelViewMatrix,
            modelViewMatrix,
            [-0.0, 0.0, -6.0]
        );
        // Rotate cube
        mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            this.rotation,
            [0, 0, 1]
        );
        mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            this.rotation * 0.7,
            [0, 1, 0]
        );

        // Tell WebGL how to put buffer position data into vertexPosition attribute
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset
            );

            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition
            );
        }

        // Tell WebGL how to put buffer color data into vertexColor attribute
        {
            const numComponents = 4;
            const type = gl.UNSIGNED_BYTE;
            const normalize = true;
            const stride = 0;
            const offset = 0;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset
            );
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexColor
            );
        }

        // Tell WebGL how to use index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        // Use program as shader program
        gl.useProgram(programInfo.program);

        // Set shader uniforms
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            ((projectionMatrix: any): Float32Array)
        );
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            ((modelViewMatrix: any): Float32Array)
        );

        {
            const offset = 0;
            const type = gl.UNSIGNED_SHORT;
            const vertexCount = 36;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }

        this.rotation += deltaTime;
    }


    /**
     * Initializes a WebGL context
     */
    initializeGl: () => void;
    initializeGl(): void{
        // Initialize WebGL context
        const canvas = document.querySelector('.Canvas');
        if(!(canvas instanceof HTMLCanvasElement)){
            return;
        }
        const gl = canvas.getContext('webgl');
        if(!gl) {
            console.log('WebGL not supported');
            return
        }

        const shaderProgram = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

        const programInfo: ProgramInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
            }
        }

        const buffers = this.initializeBuffers(gl);

        /**
         * Renders a frame
         * @param  {number} now    Time since page was loaded
         */
        function renderGl(now: number): void {
            now *= 0.001;
            const deltaTime = now - this.then;
            this.then = now;

            this.drawScene(gl, programInfo, buffers, deltaTime);
            requestAnimationFrame(renderGl);
        }

        renderGl = renderGl.bind(this);

        requestAnimationFrame(renderGl);
    }

    /**
     * Initializes buffers
     * @param  {WebGLRenderingContext} gl   WebGL context
     * @return {{position: WebGLBuffer}}    Object with buffers
     */
    initializeBuffers: (gl: WebGLRenderingContext) => BufferContainer;
    initializeBuffers(gl: WebGLRenderingContext): BufferContainer {
        // Create a buffer for the cube's position
        const positionBuffer = gl.createBuffer();

        // Array of position coordinates
        const positions = [
            // Front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

            // Right face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,

        ];

        // Set positionBuffer as current buffer to apply operations on
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Load positions array into buffer
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);

        // Create buffer for colors
        const colorBuffer = gl.createBuffer();
        // Create color array for all vertices
        const faceColors = [
            [255, 255, 255, 255],
            [255, 0.0, 0.0, 255],
            [0.0, 255, 0.0, 255],
            [0.0, 0.0, 255, 255],
            [255, 255, 0.0, 255],
            [255, 0.0, 255, 255],
        ];
        var colors = [];
        for(let i = 0; i < faceColors.length; ++i){
            const c = faceColors[i];
            colors = colors.concat(c, c, c, c);
        }


        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Uint8Array(colors),
            gl.STATIC_DRAW,
        );


        //Create a buffer for indices
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        const indices = [
            0, 1, 2,    0, 2, 3,    // Front
            4, 5, 6,    4, 6, 7,    // Back
            8, 9, 10,   8, 10, 11,  // Top
            12, 13, 14, 12, 14, 15, // Bottom
            16, 17, 18, 16, 18, 19,  // Right
            20, 21, 22, 20, 22, 23, // Left
        ];

        // Send index data to element array
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW
        );

        return {
            position: positionBuffer,
            color: colorBuffer,
            indices: indexBuffer
        };
    }


}
