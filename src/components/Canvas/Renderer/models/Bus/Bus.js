// flow
import type {Vec3} from 'gl-matrix';

import {geometry} from './geometry';
import {colors} from './colors';

export default class Bus {
    position: Vec3;
    yRotation: number;



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
