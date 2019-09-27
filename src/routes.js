import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Listener from './Components/Listener';
import Recorder from './Components/Recorder';
import RecorderStream from './Components/RecorderStream';

function Routes(){
    return(
        <>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={()=><h1>Index Page</h1>} />
                    <Route exact path="/record" component={Recorder} />
                    <Route exact path="/listener" component={Listener} />
                </Switch>
            </BrowserRouter>
        </>
    );
}

export default Routes;