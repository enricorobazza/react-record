import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import socketIOClient from "socket.io-client";
import {withWaveHeader, appendBuffer} from '../utilities/recorder/utilities';
import {IP} from '../config';
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
          source: null
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
      // const audioContext = this.getAudioContext();
      if(this.state.audioContext == null) return;

      const {audioContext} = this.state;

      var array = JSON.parse(data);
      // console.log(array);
      var newArray = this.copyArray(array, 4096);
      // var array32 = new Float32Array(newArray);
      // console.log(array32);

      // return;

      const audioBufferChunk = await audioContext.decodeAudioData(encodeWAV(newArray, 1, 4096));
      // const audioBufferChunk = await audioContext.decodeAudioData(withWaveHeader(data, 2, 4096));
      // const audioBufferChunk = await audioContext.decodeAudioData(withWaveHeader(data, 2, 44100));

      // console.log(audioBufferChunk);

      if(this.source) console.log(this.source.buffer);

      const newaudioBuffer = (this.source && this.source.buffer)
          ? appendBuffer(this.source.buffer, audioBufferChunk, audioContext)
          : audioBufferChunk;
      this.source = audioContext.createBufferSource();
      this.source.buffer = newaudioBuffer;

      // console.log(newaudioBuffer);

      this.source.connect(audioContext.destination);
      this.source.start(this.source.buffer.duration);

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
