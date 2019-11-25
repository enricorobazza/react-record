import React, { Component } from 'react';
import socketIOClient from "socket.io-client";
import {IP, bufferSize} from '../config';
import {Background, Input, Title, Button} from './styles';

class RecorderStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      audioContext: null,
      socket: null,
      username: "",
      error: ""
    };
  }

  async componentDidMount() {
    const socket = socketIOClient(IP);
    this.setState({socket});
  }

  startRecording(){
    this.setState({recording:true});
    if(!this.state.audioContext) this.record();
  }

  stopRecord = ()=>{
    this.setState({recording:false, audioContext:null});
  }

  record = () =>{
    navigator.mediaDevices.getUserMedia({ audio:true, video: false }).then((stream) => {
      const audioContext = new AudioContext();
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
      <Background background_color={"#1abc9c"}>
        <Title>Emitir áudio</Title>
        <Input disabled={this.state.recording} placeholder="Seu nome" value={this.state.username} onChange={(input)=>{
          this.setState({username: input.target.value});
        }}/>
        <Button active_color={"#74b9ff"} active={this.state.recording}
          onClick={() => {
            if(this.state.username === "") alert("Preencha seu nome!");
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
