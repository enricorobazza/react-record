import React, { Component } from 'react';
import Recorder from '../utilities/recorder';
import socketIOClient from "socket.io-client";
import AudioSupport from '../utilities/recorder/audio-support';
import ReactAudioPlayer from 'react-audio-player';
import {IP, bufferSize} from '../config';
import {withWaveHeader, appendBuffer} from '../utilities/recorder/utilities';

class RecorderStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stream: null,
      recording: false,
      recorder: null,
      audioContext: null,
      socket: null,
      blob: new Float32Array(0),
      blobFormatted: null,
    };
  }

  async componentDidMount() {
    const socket = socketIOClient(IP);
    this.setState({socket});
  }

  getAudioContext =  () => {
    AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContent = new AudioContext();
    return audioContent;
  };

  startRecording(){
    this.setState({recording:true});
    if(!this.state.audioContext) this.record();
  }

  record = () =>{
    window.navigator.getUserMedia({ audio:true }, (stream) => {
        const audioContext = this.getAudioContext();
        this.setState({audioContext});

        // get mic stream
        const source = audioContext.createMediaStreamSource( stream );
        const scriptNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
        source.connect(scriptNode);
        scriptNode.connect(audioContext.destination);
    
        // on process event
        scriptNode.onaudioprocess = (e) => {
          if(!this.state.recording) return;
          const {socket} = this.state;
          let datetime = new Date();
          console.log(datetime.getTime());
          var data = JSON.stringify( {data: e.inputBuffer.getChannelData(0), time: datetime.getTime()});
          socket.emit('audioSend', data);
        };
    }, console.log);
    
}

stopRecord = ()=>{
  this.setState({recording:false});
}

  render() {
    return (
      <>
      <button
        onClick={() => {
          this.state.recording ? this.stopRecord() : this.startRecording();
        }}
        >
        {this.state.recording ? "Parar gravação" : "Começar a gravar"}
      </button>
      <br />
      </>
    );
  }
}

export default RecorderStream;
