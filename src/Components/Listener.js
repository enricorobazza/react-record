import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import socketIOClient from "socket.io-client";
import {withWaveHeader, appendBuffer} from '../utilities/recorder/utilities';
import {IP, bufferSize} from '../config';
import {encodeWAV} from '../utilities/newUtilities';

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
        };
      }

    async componentDidMount() {
        const socket = socketIOClient(IP);
        this.setState({socket});

        socket.on('audioSend', message => {
            // console.log(message.time)
            this.play(message);
        });
    }

   copyArray(data, sampleRate){
     var array = [];
     for(var i=0;i<sampleRate;i++){
       array.push(data[i]);
     }
     return array;
   }

    play = async (data) =>{
      if(this.state.audioContext == null) return;

      const {audioContext} = this.state;
      // console.log(data);
      var array = JSON.parse(data);
      var newArray = this.copyArray(array.data, bufferSize);

      var datetime = new Date();
      var prevDateTime = new Date(array.time);

      var delay = Math.abs(datetime - prevDateTime);
      this.setState({
        sampleCount: this.state.sampleCount+1, 
        avgDelay: (this.state.avgDelay * this.state.sampleCount + delay) / (this.state.sampleCount + 1)
      })

      console.log("Sample count: ", this.state.sampleCount);
      console.log("Current delay: ", delay);
      console.log("Avg Delay: ", this.state.avgDelay);

      // console.log(array.time);
      const audioBufferChunk = await audioContext.decodeAudioData(encodeWAV(newArray, 1, 44100));

      const newaudioBuffer = (this.source && this.source.buffer)
          ? appendBuffer(this.source.buffer, audioBufferChunk, audioContext)
          : audioBufferChunk;
      this.source = audioContext.createBufferSource();
      this.source.buffer = newaudioBuffer;

      this.source.connect(audioContext.destination);
      this.source.start(audioBufferChunk.duration, this.source.buffer.duration - audioBufferChunk.duration);
      // this.source.start(audioBufferChunk.duration*40);
      // this.source.start(this.source.buffer.duration,audioBufferChunk.duration);
      // this.source.start(this.source.buffer.duration);
      // console.log(this.source.buffer.duration);

      // this.setState({source});
      // console.log(source.buffer.duration);
  }

  getAudioContext =  () => {
    AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContent = new AudioContext();
    return audioContent;
  };

  render() {
    return (
        <>
            {this.state.blobIndex >= 0 ? <h1>Listen to Audio:</h1> : <h1>Waiting for Audio.</h1>}
            <br />
            <button onClick={()=>{
              var audioContext = this.getAudioContext();
              this.setState({audioContext:audioContext});
            }}>Start Listening</button>
            <br />
            {this.state.blobIndex >= 0 && <ReactAudioPlayer
                src={this.state.blob[this.state.blobIndex]}
                controls
                autoplay = {true}
                onEnded = {(event) => {
                    this.setState({blobIndex: this.state.blobIndex + 1});
                }}
                onCanPlay={(event)=>{
                    // console.log(event);
                    event.target.play();
                    //alert('loaded');
                    //console.log(event.target);
                }}
            />}
      </>
    );
  }
}
