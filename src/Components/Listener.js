import React, { Component } from 'react';
import socketIOClient from "socket.io-client";
import {IP, bufferSize} from '../config';
import {encodeWAV, appendBuffer, copyArray} from '../utilities';
import {Background, Title, Button, Input} from './styles';

export default class Listener extends Component {

  constructor(props) {
      super(props);
      this.state = {
        socket: null,
        audioContext: null,
        source: null,
        username: "",
        listenTo: "",
        listening: false,
        prevTime: null,
    };
  }

  async componentDidMount() {
      const socket = socketIOClient(IP);
      this.setState({socket});
  }

  calcDelay = (prev) => {
    let nowTime = new Date();
    let prevTime = new Date(prev);
    return Math.abs(nowTime - prevTime);
  }

  playChunk = (audioBufferChunk, sync, delay) => {
    if(this.state.audioContext == null) return;

    const {audioContext} = this.state;

    const newaudioBuffer = (this.state.source && this.state.source.buffer)
        ? appendBuffer(this.state.source.buffer, audioBufferChunk, audioContext)
        : audioBufferChunk;
    var source = audioContext.createBufferSource();
    source.buffer = newaudioBuffer;

    source.connect(audioContext.destination);

    let syncDelay = 3000;

    if(!sync) source.start(audioBufferChunk.duration, source.buffer.duration - audioBufferChunk.duration);
    else if(delay < syncDelay) source.start((syncDelay - delay)/1000, source.buffer.duration - audioBufferChunk.duration);

    this.setState({source});
  }

  play = async (array) =>{
    if(this.state.audioContext == null) return;

    const {audioContext} = this.state;

    var newArray = copyArray(array.data, bufferSize);

    var delay = this.calcDelay(array.time);

    this.state.socket.emit('timeSave', {username: this.state.username, listenTo:this.state.listenTo, delay});

    const audioBufferChunk = await audioContext.decodeAudioData(encodeWAV(newArray, 1, 44100));

    this.playChunk(audioBufferChunk, false, delay);    
  }

  render() {
    return (
        <>
          <Background>
            <Title>Ouvir áudio</Title>
            <Input disabled={this.state.listening} placeholder="Seu nome" value={this.state.username} onChange={(input)=>{
              this.setState({username: input.target.value});
            }}/>
             <Input disabled={this.state.listening} placeholder="Quem deseja ouvir" value={this.state.listenTo} onChange={(input)=>{
              this.setState({listenTo: input.target.value});
              }}/>
               <Button active={this.state.listening} onClick={()=>{
                 if((this.state.listenTo === "" || this.state.username === "") && !this.state.listening){
                   alert("Preencha com seu nome e com o nome de quem deseja ouvir.");
                 }
                 else{
                  if(this.state.listening){
                    this.setState({audioContext:null});
                    this.state.socket.off('audioSend'+this.state.listenTo);
                  }
                  else{ 
                    var audioContext = new AudioContext();
                    this.setState({audioContext:audioContext});
                    this.state.socket.on('audioSend'+this.state.listenTo, message => {
                      this.play(message);
                    });
                  }
                  this.setState({listening: !this.state.listening});
                } 
            }}>{this.state.listening? "Parar de ouvir": "Começar a ouvir"}</Button>
          </Background>
      </>
    );
  }
}
