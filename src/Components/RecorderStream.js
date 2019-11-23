import React, { Component } from 'react';
import Recorder from '../utilities/recorder';
import socketIOClient from "socket.io-client";
import AudioSupport from '../utilities/recorder/audio-support';
import ReactAudioPlayer from 'react-audio-player';
import {IP, bufferSize} from '../config';
import {withWaveHeader, appendBuffer} from '../utilities/recorder/utilities';
import styled from 'styled-components';

const Background = styled.div`
    background-color: #1abc9c;
    width: 100vw;
    height: 100vh;
    display:flex;
    padding: 30px;
    box-sizing: border-box;
    flex-direction:column;
    align-items: center;
    margin: 0;
  `;

  const Title = styled.h1`
      color: #fff;
    `;

  const Button = styled.button`
    padding: 15px 0;
    background-color: ${props => props.active ? "#2980b9" : "#2c3e50"};
    border: none;
    color: #fff;
    border-radius: 10px;
    font-size:12pt;
    max-width: 430px;
    width:100%;
  `;

  const Input = styled.input`
    padding: 15px 15px;
    border-radius: 10px;
    max-width: 400px;
    width: calc(100% - 30px);
    border:none;
    margin-bottom: 10px;
    font-size: 12pt;
  `;



class RecorderStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      recorder: null,
      audioContext: null,
      socket: null,
      blob: new Float32Array(0),
      blobFormatted: null,
      username: "",
      error: ""
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

  stopRecord = ()=>{
    this.setState({recording:false, audioContext:null});
  }

  record = () =>{
    // window.navigator.getUserMedia = ( window.navigator.getUserMedia ||
    //   window.navigator.webkitGetUserMedia ||
    //   window.navigator.mozGetUserMedia ||
    //   window.navigator.msGetUserMedia);


    // if(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia({ audio:true, video: false }).then((stream) => {
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
        var data =  {data: e.inputBuffer.getChannelData(0), time: datetime.getTime(), username: this.state.username};
        socket.emit('audioSend', data);
      };
  }).catch((err)=>{
    this.setState({error: err});
  });
    
}


  render() {
    return (
      <>
      <Background>
        <Title>Emitir áudio</Title>
        <Input disabled={this.state.recording} placeholder="Seu nome" value={this.state.username} onChange={(input)=>{
          this.setState({username: input.target.value});
        }}/>
        <Button active={this.state.recording}
          onClick={() => {
            if(this.state.username == "") alert("Preencha seu nome!");
            else this.state.recording ? this.stopRecord() : this.startRecording();
          }}
          >
          {this.state.recording ? "Parar gravação" : "Começar a gravar"}
        </Button>
        <br />
        <div>{this.state.error}</div>
      </Background>
      </>
    );
  }
}

export default RecorderStream;
