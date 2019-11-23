import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Listener from './Components/Listener';
import Recorder from './Components/Recorder';
import RecorderStream from './Components/RecorderStream';
import SoundTest from './Components/SoundTest';
import Udp from './Components/Udp';

function Routes(){
    return(
        <>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={()=><h1>Index Page</h1>} />
                    <Route exact path="/udp" component={Udp} />
                    <Route exact path="/record" component={Recorder} />
                    <Route exact path="/recordStream" component={RecorderStream} />
                    <Route exact path="/listener" component={Listener} />
                    <Route exact path="/soundtest" component={SoundTest} />
                </Switch>
            </BrowserRouter>
        </>
    );
}

export default Routes;