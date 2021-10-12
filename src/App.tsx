import './App.css';
import React, {Fragment} from "react";
import HandDetection from "./Components/HandDetection/HandDetection";
import {Board} from "./Components/Board/Board";


function App() {
    return <Fragment>
        <Board />
        <HandDetection />
    </Fragment>
}

export default App;
