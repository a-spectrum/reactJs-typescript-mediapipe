import './App.css';
import React, {Fragment} from "react";
import FaceDetection from "./Components/FaceDetection/FaceDetection";
import HandDetection from "./Components/HandDetection/HandDetection";
import {Board} from "./Components/Board/Board";


function App() {
    return <Fragment>
        <Board />
        <HandDetection />
        {/*<FaceDetection />*/}
    </Fragment>
}

export default App;
