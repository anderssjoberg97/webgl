// @flow
import React, { Component } from 'react';
import {mat4, mat3} from 'gl-matrix';
import type {Mat3} from 'gl-matrix';

import {compileShader, createShaderProgram, randomInt} from './helpers';
import {vertexShaderSource} from './vertexShader';
import {fragmentShaderSource} from './fragmentShader';
import './Canvas.css';

type ProgramInfo = {
    program: WebGLProgram,
    attributeLocations: {
        position: number,
    },
    uniformLocations: {
        color: WebGLUniformLocation,
        resolution: WebGLUniformLocation,
        matrix: WebGLUniformLocation,
    }
};

type BufferInfo = {
    position: WebGLBuffer
}

type Props = {

};
export default class Canvas extends Component<Props> {

    translation = [200, 300];
    angle = 0.5 * Math.PI;
    rotation = [Math.sin(this.angle), Math.cos(this.angle)];
    scale = [1, 1];
    color = [Math.random(), Math.random(), Math.random(), 1];
    matrix = {
        translation: function(tx: number, ty: number): Mat3 {
            let translationMatrix = mat3.create();
            mat3.set(translationMatrix,
                1, 0, 0,
                0, 1, 0,
                tx, ty, 1,
            );
            return translationMatrix;
        },
        rotation: function(angle: number): Mat3 {
            let c = Math.cos(angle);
            let s = Math.sin(angle);
            let rotationMatrix = mat3.create();
            mat3.set(rotationMatrix,
                c, -s, 0,
                s, c, 0,
                0, 0, 1,
            );
            return rotationMatrix;
        },
        scaling: function(sx: number, sy: number): Mat3 {
            let scalingMatrix = mat3.create();
            mat3.set(scalingMatrix,
                sx, 0, 0,
                0, sy, 0,
                0, 0, 1,
            );
            return scalingMatrix;

        },
        projection: function(width: number, height: number): Mat3{
            let projectionMatrix = mat3.create();
            mat3.set(projectionMatrix,
                2 / width, 0, 0,
                0, -2 / height, 0,
                -1, 1, 1
            );
            return projectionMatrix;
        },
        translate: function(m: Mat3, tx: number, ty: number): void {
            mat3.multiply(m, m, this.translation(tx, ty))
        },
        rotate: function(m: Mat3, angle: number): void {
            mat3.multiply(m, m, this.rotation(angle));
        },
        scale: function(m: Mat3, sx: number, sy: number): void {
            mat3.multiply(m, m, this.scaling(sx, sy));
        }
    };

    constructor(){
        super();
    }
    componentDidMount(){
        this.initialize();
    }

    shouldComponentUpdate(nextProps: Props): bool{
        return false;
    }


    render() {
        return (<canvas className={'Canvas'} width={800} height={600}></canvas>);
    }
    /**
     * Initializes a WebGL context
     */
    initialize(): void {
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

        // Look up where vertex data needs to be stored
        const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');

        // Look up uniforms
        const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, 'u_resolution');
        const colorUniformLocation = gl.getUniformLocation(shaderProgram, 'u_color');
        const matrixUniformLocation = gl.getUniformLocation(shaderProgram, 'u_matrix');

        // Create a buffer for 2d clip space points
        const positionBuffer = gl.createBuffer();

        // Bind positionBuffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        var positions = [
            10, 20,
            80, 20,
            10, 30,
            10, 30,
            80, 20,
            80, 30,
        ];

        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW
        );

        this.drawScene(gl,
            {
                program: shaderProgram,
                attributeLocations: {
                    position: positionAttributeLocation
                },
                uniformLocations: {
                    resolution: resolutionUniformLocation,
                    color: colorUniformLocation,
                    matrix: matrixUniformLocation,
                }
            },
            {
                position: positionBuffer
            }
        );

    }

    /**
     * Draws the  scene
     * @param {WebGLRenderingContext} gl    WebGL context
     * @param {ProgramInfo} programInfo     Info about the program
     * @param {BufferInfo} BufferInfo       Info about  buffer locations
     */
    drawScene(gl: WebGLRenderingContext, programInfo: ProgramInfo, bufferInfo: BufferInfo): void{
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear canvas
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Use recently set up program
        gl.useProgram(programInfo.program);

        // Set resolution uniform
        gl.uniform2f(programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);

        // Set color uniform
        gl.uniform4fv(programInfo.uniformLocations.color, this.color);

        // Compute matrices and set uniform
        let matrix = this.matrix.projection(gl.canvas.width, gl.canvas.height);
        this.matrix.translate(matrix, this.translation[0], this.translation[1]);
        this.matrix.rotate(matrix, this.angle);
        this.matrix.scale(matrix, this.scale[0], this.scale[1]);
        this.matrix.translate(matrix, -50, -75);
        gl.uniformMatrix3fv(programInfo.uniformLocations.matrix, false, (matrix: any));


        // Turn on the vertex attribute
        gl.enableVertexAttribArray(programInfo.attributeLocations.position);

        // Bind the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.position);

        // Set up rectangle
        this.setGeometry(gl);

        // Tell the attribute how to get data out of positionbuffer
        {
            const size = 2;             // 2 components per iteration
            const type = gl.FLOAT;      // Data is of type 32bit float
            const normalize = false;    // Don't normalize the data
            const stride = 0;           // Move forward regurlarly no skipping
            const offset = 0;           // Start at the beginning of buffer
            gl.vertexAttribPointer(programInfo.attributeLocations.position,
                size,
                type,
                normalize,
                stride,
                offset
            );
        }

        // Draw rectangle
        const primitiveType = gl.TRIANGLES;
        const offset = 0;
        const count = 18;
        gl.drawArrays(primitiveType, offset, count);
    }

    setRectangle(gl: WebGLRenderingContext, x: number, y: number, width: number, height: number): void {
        let x1 = x;
        let x2 = x + width;
        let y1 = y;
        let y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array([
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2
            ]),
            gl.STATIC_DRAW
        );
    }

    setGeometry(gl: WebGLRenderingContext){
        let width = 100;
        let height = 150;
        let thickness = 30;
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array([
                // left column
                0, 0,
                30, 0,
                0, 150,
                0, 150,
                30, 0,
                30, 150,

                // top rung
                30, 0,
                100, 0,
                30, 30,
                30, 30,
                100, 0,
                100, 30,

                // middle rung
                30, 60,
                67, 60,
                30, 90,
                30, 90,
                67, 60,
                67, 90,
            ]),
            gl.STATIC_DRAW
        );
    }


}
