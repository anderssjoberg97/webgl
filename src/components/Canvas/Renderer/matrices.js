// @flow

import {mat4} from 'gl-matrix';
import type {Mat4} from 'gl-matrix';

export const matrices = {
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
