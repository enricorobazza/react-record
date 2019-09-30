import React, {useState} from 'react';
import {withWaveHeader, appendBuffer} from '../utilities/recorder/utilities';

export default function SoundTest(){

    const [count, setCount] = useState(0);

    const record = () =>{
        window.navigator.getUserMedia({ audio:true }, (stream) => {
            const audioContext = new AudioContext();
            // get mic stream
            const source = audioContext.createMediaStreamSource( stream );
            const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
            source.connect(scriptNode);
            scriptNode.connect(audioContext.destination);
            // output to speaker
            // source.connect(audioContext.destination);
        
            // on process event
            scriptNode.onaudioprocess = (e) => {
              // get mica data
            //   console.log(e.inputBuffer.getChannelData(0))
              play(e.inputBuffer.getChannelData(0));
            };
        }, console.log);
    }

    const getAudioContext =  () => {
        AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContent = new AudioContext();
        return audioContent;
      };

    const play = async (data) =>{
        const audioContext = getAudioContext();

        console.log(data);

        const audioBufferChunk = await audioContext.decodeAudioData(withWaveHeader(data, 2, 44100));

        console.log(audioBufferChunk);

        const newaudioBuffer = (source && source.buffer)
            ? appendBuffer(source.buffer, audioBufferChunk, audioContext)
            : audioBufferChunk;
        const source = audioContext.createBufferSource();
        source.buffer = newaudioBuffer;

        // console.log(newaudioBuffer);

        source.connect(audioContext.destination);
        source.start(source.buffer.duration);
        // console.log(source.buffer.duration);
    }


    return(
        <>
            <button onClick={()=>record()}>Record</button>
            <br />
            <button onClick={()=>setCount(count+1)}>Teste</button>
            <br />
            {count}
        </>
    );
}
