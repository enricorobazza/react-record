import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import socketIOClient from "socket.io-client";
import {withWaveHeader, appendBuffer} from '../utilities/recorder/utilities';

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
        const socket = socketIOClient("http://192.168.1.154:8000");
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

    play = async (data) =>{
      const audioContext = this.getAudioContext();

      // console.log(data);

      const audioBufferChunk = await audioContext.decodeAudioData(withWaveHeader(data, 2, 44100));

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
