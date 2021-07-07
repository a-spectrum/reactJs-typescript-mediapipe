import './App.css';
import React, {Fragment} from "react";
import FaceDetection from "./Components/FaceDetection/FaceDetection";
import HandDetection from "./Components/HandDetection/HandDetection";


function App() {
    return <Fragment>
        <HandDetection />
        {/*<FaceDetection />*/}
    </Fragment>
}

export default App;
