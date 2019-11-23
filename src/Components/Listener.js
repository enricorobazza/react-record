import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import socketIOClient from "socket.io-client";
import {withWaveHeader, appendBuffer} from '../utilities/recorder/utilities';
import {IP, bufferSize} from '../config';
import {encodeWAV} from '../utilities/newUtilities';
import styled from 'styled-components';


const Background = styled.div`
    background-color: #a29bfe;
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
    border: none;
    padding: 15px 15px;
    background-color: ${props => props.active ? "#8e44ad" : "#2c3e50"};
    color: #fff;
    border-radius: 10px;
    font-size:12pt;
    max-width: 430px;
    width: 100%;
    margin: 0;
    display:block;
  `;

  const Input = styled.input`
    padding: 15px 15px;
    border-radius: 10px;
    max-width: 400px;
    width:calc(100% - 30px);
    border:none;
    margin-bottom: 10px;
    font-size: 12pt;
  `;


export default class Listener extends Component {

    source = null;

    constructor(props) {
        super(props);
        this.state = {
          socket: null,
          blob: [],
          blobIndex: -1,
          audioContext: null,
          source: null,
          avgDelay: 0,
          sampleCount: 0,
          username: "",
          listenTo: "",
          listening: false
        };
      }

    async componentDidMount() {
        const socket = socketIOClient(IP);
        this.setState({socket});
    }

   copyArray(data, sampleRate){
     var array = [];
     for(var i=0;i<sampleRate;i++){
       array.push(data[i]);
     }
     return array;
   }

    play = async (array) =>{
      if(this.state.audioContext == null) return;

      const {audioContext} = this.state;

      var newArray = this.copyArray(array.data, bufferSize);

      var datetime = new Date();
      var prevDateTime = new Date(array.time);
      var prevServerDateTime = new Date(array.stime);

      var delay = Math.abs(datetime - prevDateTime);
      var sDelay = Math.abs(datetime - prevServerDateTime);
      this.setState({
        sampleCount: this.state.sampleCount+1, 
        avgDelay: (this.state.avgDelay * this.state.sampleCount + delay) / (this.state.sampleCount + 1)
      })

      console.log("Sample count: ", this.state.sampleCount);
      console.log("Current delay: ", delay);
      console.log("Current server delay: ", sDelay);
      console.log("Avg Delay: ", this.state.avgDelay);

      this.state.socket.emit('timeSave', {username: this.state.username, listenTo:this.state.listenTo, time: delay});

      const audioBufferChunk = await audioContext.decodeAudioData(encodeWAV(newArray, 1, 44100));

      const newaudioBuffer = (this.source && this.source.buffer)
          ? appendBuffer(this.source.buffer, audioBufferChunk, audioContext)
          : audioBufferChunk;
      this.source = audioContext.createBufferSource();
      this.source.buffer = newaudioBuffer;

      this.source.connect(audioContext.destination);
      this.source.start(audioBufferChunk.duration, this.source.buffer.duration - audioBufferChunk.duration);
  }

  getAudioContext =  () => {
    AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContent = new AudioContext();
    return audioContent;
  };

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
                 if((this.state.listenTo == "" || this.state.username == "") && !this.state.listening){
                   alert("Preencha com seu nome e com o nome de quem deseja ouvir.");
                 }
                 else{
                  if(this.state.listening){
                    this.setState({audioContext:null});
                    this.state.socket.off('audioSend'+this.state.listenTo);
                  }
                  else{ 
                    var audioContext = this.getAudioContext();
                    this.setState({audioContext:audioContext});
                    this.state.socket.on('audioSend'+this.state.listenTo, message => {
                      // console.log(message.time)
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
