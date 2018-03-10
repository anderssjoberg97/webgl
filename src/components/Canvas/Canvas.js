// @flow
import React, { Component } from 'react';
import {mat4} from 'gl-matrix';
import type {Mat4} from 'gl-matrix';

import {compileShader, createShaderProgram, randomInt} from './helpers';
import {vertexShaderSource} from './vertexShader';
import {fragmentShaderSource} from './fragmentShader';

import {setGeometry, setColors} from './models/letter/';

import './Canvas.css';

type ProgramInfo = {
    program: WebGLProgram,
    attributeLocations: {
        position: number,
        color: number,
    },
    uniformLocations: {
        matrix: WebGLUniformLocation,
    }
};

type BufferInfo = {
    position: WebGLBuffer,
    color: WebGLBuffer,
}

type Props = {

};
export default class Canvas extends Component<Props> {

    translation = [-100, 0, -360];
    rotation = [ 0 * Math.PI, 0 * Math.PI, 0 * Math.PI];
    scale = [1, 1, 1];
    color = [Math.random(), Math.random(), Math.random(), 4];
    fieldOfView = 60 * Math.PI / 180 ;

    matrix = {
        perspective: function(fieldOfView: number, aspect: number, near: number, far: number): Mat4{
            let f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfView);
            let rangeInv = 1.0 / (near - far);
            let perspectiveMatrix = mat4.create();
            mat4.set(perspectiveMatrix,
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (near + far) * rangeInv, -1,
                0, 0, near * far * rangeInv * 2, 0
            );
            return perspectiveMatrix;
        },
        projection: function(width: number, height: number, depth: number): Mat4{
            let projectionMatrix = mat4.create();
            mat4.set(projectionMatrix,
                2 / width, 0, 0, 0,
                0, -2 / height, 0, 0,
                0, 0, 2 / depth, 0,
                -1, 1, 0, 1,
            );
            return projectionMatrix;
        },
        ortographic: function(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
            let ortographicMatrix = mat4.create();
            mat4.set(ortographicMatrix,
                2 / (right - left), 0, 0, 0,
                0, -2 / (top - bottom), 0, 0,
                0, 0, 2 / (near - far), 0,

                (left + right) / (left - right),
                (bottom + top) / (bottom -top),
                (near + far) / (near - far),
                1,
            );
            return ortographicMatrix;
        },
        translation: function(tx: number, ty: number, tz: number): Mat4 {
            let translationMatrix = mat4.create();
            mat4.set(translationMatrix,
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                tx, ty, tz, 1,
            );
            return translationMatrix;
        },
        xRotation: function(angle: number): Mat4 {
            let c = Math.cos(angle);
            let s = Math.sin(angle);
            let rotationMatrix = mat4.create();
            mat4.set(rotationMatrix,
                1, 0, 0, 0,
                0, c, s, 0,
                0, -s, c, 0,
                0, 0, 0, 1,
            );
            return rotationMatrix;
        },
        yRotation: function(angle: number): Mat4 {
            let c = Math.cos(angle);
            let s = Math.sin(angle);
            let rotationMatrix = mat4.create();
            mat4.set(rotationMatrix,
                c, 0, -s, 0,
                0, 1, 0, 0,
                s, 0, c, 0,
                0, 0, 0, 1,
            );
            return rotationMatrix;
        },
        zRotation: function(angle: number): Mat4 {
            let c = Math.cos(angle);
            let s = Math.sin(angle);
            let rotationMatrix = mat4.create();
            mat4.set(rotationMatrix,
                c, s, 0, 0,
                -s, c, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            );
            return rotationMatrix;
        },
        scaling: function(sx: number, sy: number, sz: number): Mat4 {
            let scalingMatrix = mat4.create();
            mat4.set(scalingMatrix,
                sx, 0, 0, 0,
                0, sy, 0, 0,
                0, 0, sz, 0,
                0, 0, 0, 1,
            );
            return scalingMatrix;

        },
        translate: function(m: Mat4, tx: number, ty: number, tz: number): void {
            mat4.multiply(m, m, this.translation(tx, ty, tz));
        },
        xRotate: function(m: Mat4, angle: number): void {
            mat4.multiply(m, m, this.xRotation(angle));
        },
        yRotate: function(m: Mat4, angle: number): void {
            mat4.multiply(m, m, this.yRotation(angle));
        },
        zRotate: function(m: Mat4, angle: number): void {
            mat4.multiply(m, m, this.zRotation(angle));
        },
        scale: function(m: Mat4, sx: number, sy: number, sz: number): void {
            mat4.multiply(m, m, this.scaling(sx, sy, sz));
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

        // Look up attribute locations
        const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');
        if(positionAttributeLocation == -1){
            console.log('Could not get position attribute');
        }
        const colorAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_color');

        // Look up uniforms
        const matrixUniformLocation = gl.getUniformLocation(shaderProgram, 'u_matrix');

        // Create a buffer for position data
        const positionBuffer = gl.createBuffer();

        // Create a buffer for color data
        const colorBuffer = gl.createBuffer();

        // Draw scene
        this.drawScene(gl,
            {
                program: shaderProgram,
                attributeLocations: {
                    position: positionAttributeLocation,
                    color: colorAttributeLocation,
                },
                uniformLocations: {
                    matrix: matrixUniformLocation,
                }
            },
            {
                position: positionBuffer,
                color: colorBuffer,
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

        // Clear canvas and depth buffer
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Turn on culling
        gl.enable(gl.CULL_FACE);

        // Enable depth buffer
        gl.enable(gl.DEPTH_TEST);

        // Use recently set up program
        gl.useProgram(programInfo.program);

        // Compute matrices and set matrix uniform
        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let zNear = 1;
        let zFar = 2000;
        let matrix = this.matrix.perspective(this.fieldOfView, aspect, zNear, zFar);
        this.matrix.translate(matrix, this.translation[0], this.translation[1], this.translation[2]);
        this.matrix.xRotate(matrix, this.rotation[0]);
        this.matrix.yRotate(matrix, this.rotation[1]);
        this.matrix.zRotate(matrix, this.rotation[2]);
        this.matrix.scale(matrix, this.scale[0], this.scale[1], this.scale[2]);
        //this.matrix.translate(matrix, -50, -75); // For moving origin point
        gl.uniformMatrix4fv(programInfo.uniformLocations.matrix, false, (matrix: any));


        // Turn on the vertex attribute
        gl.enableVertexAttribArray(programInfo.attributeLocations.position);
        // Bind the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.position);
        // Load in geometry
        setGeometry(gl);
        // Tell the attribute how to get data out of positionbuffer
        {
            const size = 3;             // 3 components per iteration
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

        // Turn on the color attribute
        gl.enableVertexAttribArray(programInfo.attributeLocations.color);
        // Bind the color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.color);
        // Load in colors
        setColors(gl);
        // Tell WebGL how to get data out of color buffer
        {
            const size = 3;
            const type = gl.UNSIGNED_BYTE;
            const normalize = true;
            const stride = 0;
            const offset = 0;
            gl.vertexAttribPointer(programInfo.attributeLocations.color,
                size,
                type,
                normalize,
                stride,
                offset,
            );
        }

        // Draw geometry
        const primitiveType = gl.TRIANGLES;
        const offset = 0;
        const count = 16 * 6;
        gl.drawArrays(primitiveType, offset, count);
    }
}
