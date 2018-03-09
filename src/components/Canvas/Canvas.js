// @flow
import React, { Component } from 'react';
import {mat4} from 'gl-matrix';

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
}



type Props = {

}
export default class Canvas extends Component<Props> {

    // When last frame was rendered
    then = 0;
    // Current rotation of square
    squareRotation = 0.0;

    constructor(){
        super();

        this.initializeGl = this.initializeGl.bind(this);
        this.initializeShaderProgram = this.initializeShaderProgram.bind(this);
        this.loadShader = this.loadShader.bind(this);
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
        // Rotate square
        mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            this.squareRotation,
            [0, 0, 1]
        );

        // Tell WebGL how to put buffer position data into vertexPosition attribute
        {
            const numComponents = 2;
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
            const type = gl.FLOAT;
            const normalize = false;
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
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }

        this.squareRotation += deltaTime;
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

        const vertexShaderSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            varying lowp vec4 vColor;

            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;

        const fragmentShaderSource = `
            varying lowp vec4 vColor;

            void main() {
                gl_FragColor = vColor;
            }
        `;

        const shaderProgram = this.initializeShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

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
     * Iniitializes a WebGL shader program
     * @param  {WebGLRenderingContext} gl    WebGL context
     * @param  {string} vertexShaderSource   Vertex shader source code
     * @param  {string} fragmentShaderSource Fragment shader source code
     * @return {WebGLProgram}                The WebGL shader program
     */
    initializeShaderProgram: (gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) => ?WebGLProgram;
    initializeShaderProgram(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string): ?WebGLProgram {
        // Create shaders
        const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
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
     * @return {WebGLShader}                    Created shader
     */
    loadShader: (gl: WebGLRenderingContext, type: number, source: string) => ?WebGLShader;
    loadShader(gl: WebGLRenderingContext, type: number, source: string): ?WebGLShader {
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
     * Initializes buffers
     * @param  {WebGLRenderingContext} gl   WebGL context
     * @return {{position: WebGLBuffer}}    Object with buffers
     */
    initializeBuffers: (gl: WebGLRenderingContext) => BufferContainer;
    initializeBuffers(gl: WebGLRenderingContext): BufferContainer {
        // Create a buffer for the squares position
        const positionBuffer = gl.createBuffer();

        // Array of position coordinates
        const positions = [
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0,
        ];

        // Set positionBuffer as current buffer to apply operations on
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Load positions array into buffer
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);

        // Create buffer for colors
        const colorBuffer = gl.createBuffer();
        // Color Array
        const colors = [
            1.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
        ];
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(colors),
            gl.STATIC_DRAW,
        );

        return {
            position: positionBuffer,
            color: colorBuffer,
        };
    }


}
