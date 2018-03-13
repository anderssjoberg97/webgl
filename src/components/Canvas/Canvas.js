// @flow
import React, { Component } from 'react';
import {mat4} from 'gl-matrix';
import type {Mat4} from 'gl-matrix';

import Renderer from './Renderer/Renderer';

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
    renderer: Renderer;

    componentDidMount(){
        this.renderer = new Renderer();
        this.renderer.startRendering();
        //requestAnimationFrame(this.renderer.draw);
    }

    shouldComponentUpdate(nextProps: Props): bool{
        return false;
    }


    render() {
        return (<canvas className={'Canvas'}></canvas>);
    }
}
