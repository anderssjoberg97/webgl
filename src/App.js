// @flow
import React, { Component } from 'react';

import './App.css';

import Canvas from './components/Canvas/Canvas.js';


type Props = {

}
export default class App extends Component<Props> {
render() {
    return (<div className="App">
        <Canvas />
    </div>);
    }
}
