// flow
import type {Vec3} from 'gl-matrix';

import {geometry} from './geometry';
import {colors} from './colors';

export default class Bus {
    position: Vec2;
    yRotation: number;
    travelSpeed: number;


    constructor(position: Vec2, yRotation: number, travelSpeed: number){
        this.position = position;
        this.yRotation = yRotation;
        this.travelSpeed = travelSpeed;
    }

    /**
     * Computes the next position for the bus
     * @param {number} deltaTime Time since last frame was rendered
     */
    generateNextPosition(deltaTime: number){
        let newX = this.position[0] + this.travelSpeed * Math.sin(this.yRotation) * deltaTime * 0.001;
        let newY = this.position[1] + this.travelSpeed * Math.cos(this.yRotation) * deltaTime * 0.001;
        //console.log(newX);
        if(newX < -500){
            this.yRotation -= ((0.5 * Math.PI) - (this.yRotation - 1 * Math.PI)) * 2;
            newX = -499;
        } else if(newX > 500) {
            this.yRotation += ((0.5 * Math.PI) - this.yRotation) * 2 + 1 * Math.PI;
            newX = 499;
        } else if (newY < -500) {
            this.yRotation -= 0.5 * Math.PI;
            newY = -499;
        } else if (newY > 500) {
            this.yRotation += 0.5 * Math.PI + ((0.5 * Math.PI) - this.yRotation);
            newY = 499;
        }
        this.position[0] = newX;
        this.position[1] = newY;
    }

    /**
     * Stores geometry data in current buffer
     * @param {WebGLRenderingContext} gl WebGL context
     */
    static uploadGeometry(gl: WebGLRenderingContext): void{
        gl.bufferData(gl.ARRAY_BUFFER,
            geometry,
            gl.STATIC_DRAW
        );
    }

    /**
     * Stores color data in current buffer
     * @param {WebGLRenderingContext} gl WebGL context
     */
    static uploadColors(gl: WebGLRenderingContext): void{
        gl.bufferData(gl.ARRAY_BUFFER,
            colors,
            gl.STATIC_DRAW
        );
    }
}
