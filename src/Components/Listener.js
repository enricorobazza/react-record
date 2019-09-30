import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import socketIOClient from "socket.io-client";
import {withWaveHeader, appendBuffer} from '../utilities/recorder/utilities';
import {IP} from '../config';

export default class Listener extends Component {

    constructor(props) {
        super(props);
        this.state = {
          socket: null,
          blob: [],
          blobIndex: -1
        };
      }

    async componentDidMount() {
        const socket = socketIOClient(IP);
        this.setState({socket});

        socket.on('audioSend', message => {
            //alert('received');
            // console.log(message);

            this.play(message);

            // var blob = new Blob([message], {type: 'audio/uav'});
            // this.setState({blob: [...this.state.blob, window.URL.createObjectURL(blob)]});
            // if(this.state.blobIndex == -1) this.setState({blobIndex:0});

            // var intervalo = setInterval(()=>{
            //     console.log(this.state.listening);
            //     if(!this.state.listening){
            //         var blob = new Blob([message], {type: 'audio/uav'});
            //         this.setState({blob: window.URL.createObjectURL(blob), listening: true});
            //         clearInterval(intervalo);
            //     }
            // }, 1000);
        });
    }

   copyArray(data, sampleRate){
     var array = [];
     for(var i=0;i<sampleRate;i++){
      //  console.log("abc");
      //  console.log(data[i]);
       array.push(data[i]);
     }
     return array;
   }

    play = async (data) =>{
      const audioContext = this.getAudioContext();

      var array = JSON.parse(data);
      var newArray = this.copyArray(array, 4096);
      var array32 = new Float32Array(newArray);
      // console.log(array32);

      var buffer = new ArrayBuffer(array32.byteLength);
      // var buffer = new ArrayBuffer(newArray.byteLength);

      var byteView = new Uint8Array(buffer);

      console.log(byteView);
      
      return;

      const audioBufferChunk = await audioContext.decodeAudioData(withWaveHeader(data, 2, 4096));
      // const audioBufferChunk = await audioContext.decodeAudioData(withWaveHeader(data, 2, 44100));

      // console.log(audioBufferChunk);

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
