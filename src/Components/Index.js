import React, {useState} from 'react';
import {Background, Title, Button, Input} from './styles';
import {Redirect} from 'react-router-dom';

function Index(){
    const [redirectToRecorder, setRecorder] = useState(false)
    const [redirectToListener, setListener] = useState(false)

    return(
        <>
            <Background background_color="#3498db">
                <Title>Hear me Talk</Title>
                <Button onClick={()=>{
                    setRecorder(true)
                }}>Emitir Áudio</Button><br />
                <Button onClick={()=>{
                    setListener(true)
                }}>Ouvir Áudio</Button>
            </Background>

            {redirectToRecorder && <Redirect to="/recorder" />}
            {redirectToListener&& <Redirect to="/listener" />}
        </>
    );
}

export default Index;