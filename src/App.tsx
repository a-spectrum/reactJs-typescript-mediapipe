import './App.css';
import React, {Fragment} from "react";
import HandDetection from "./Components/HandDetection/HandDetection";
import {Board} from "./Components/Board/Board";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import {Analyse} from "./Components/Analyse/Analyse";

function App() {
    return <Router>
        <Switch>
            <Route path="/analyse">
                <Analyse />
            </Route>
            <Route path="/">
                <Fragment>
                    <Board />
                    <HandDetection />
                </Fragment>
            </Route>
        </Switch>
    </Router>
}

export default App;
