import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Listener from './Components/Listener';
import Recorder from './Components/Recorder';
import Index from './Components/Index';

function Routes(){
    return(
        <>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={Index} />
                    <Route exact path="/recorder" component={Recorder} />
                    <Route exact path="/listener" component={Listener} />
                </Switch>
            </BrowserRouter>
        </>
    );
}

export default Routes;