// @flow
import React, { Component } from 'react';


import Renderer from './Renderer/Renderer';
import './Canvas.css';



type Props = {

};
export default class Canvas extends Component<Props> {

    renderer: Renderer;



    constructor(){
        super();
    }
    componentDidMount(){
        this.renderer = new Renderer();
        this.renderer.startRendering();
    }

    shouldComponentUpdate(nextProps: Props): bool{
        return false;
    }


    render() {
        return (<canvas className={'Canvas'} width={800} height={600}></canvas>);
    }
}
