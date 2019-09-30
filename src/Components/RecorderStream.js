import React, { Component } from 'react';
// import RecorderJS from 'recorder-js';
import Recorder from '../utilities/recorder';
import socketIOClient from "socket.io-client";
import AudioSupport from '../utilities/recorder/audio-support';
import ReactAudioPlayer from 'react-audio-player';

import {withWaveHeader, appendBuffer} from '../utilities/recorder/utilities';

// import { getAudioStream, exportBuffer } from '../utilities/audio';

class RecorderStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stream: null,
      recording: false,
      recorder: null,
      socket: null,
      blob: new Float32Array(0),
      blobFormatted: null,
    };
    // this.startRecord = this.startRecord.bind(this);
    // this.stopRecord = this.stopRecord.bind(this);
  }

  async componentDidMount() {
    // let stream;
    const socket = socketIOClient("http://192.168.1.154:8000");
    this.setState({socket});

    // try {
    //   stream = await getAudioStream();
    // } catch (error) {
    //   // Users browser doesn't support audio.
    //   // Add your handler here.
    //   console.log(error);
    // }

    // this.setState({ stream });
  }

  // startRecord(){
  //   const { stream } = this.state;

  //   const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  //   const recorder = new Recorder(audioContext);
  //   recorder.init(stream);

  //   this.setState(
  //       {
  //         recorder,
  //         recording: true
  //       },
  //       () => {
  //         this.record(audioContext.sampleRate);
  //       }
  //     );
  // }

  // record(sampleRate){
  //     const {recorder} = this.state;
  //     recorder.start();
        
  //     var support = new AudioSupport(2,sampleRate);
  //     console.log(sampleRate);

  //     var interval = setInterval(()=>{
  //       recorder.send().then((response)=>{
  //           if(this.state.recording) {
  //               // console.log(response.blob);
  //               // console.log(response);
  //               // console.log(support.getBlob(response, 'audio/wav'));
  //               // console.log(response);
  //               var blob = this.state.blob;

  //               console.log(blob);

  //               var newBlob = new Float32Array(blob.length + response.length);
  //               newBlob.set(blob);
  //               newBlob.set(response, blob.length);

  //               // console.log(blob);
  //               // blob.push(response);
  //               this.setState({blob: newBlob});
  //               // const {socket} = this.state;
  //               // socket.emit('audioSend', response);
  //               //Recorder.download(response.blob, 'my-audio-file');
  //               //recorder.start();
  //           }
  //           else clearInterval(interval);
  //       });
  //     }, 1000);
  // }


  // async stopRecord() {
  //   const { recorder, stream } = this.state;
    
  //   const { blob, buffer } = await recorder.stop()
  //   //console.log(blob);

  //   //console.log(stream.getAudioTracks())

  //   var support = new AudioSupport(2,44100);
  //   var formatted =  window.URL.createObjectURL(support.getBlob(this.state.blob, 'audio/wav'));
  //   var audio = new Audio(formatted);
  //   audio.play();

  //   // this.setState({
  //   //   blobFormatted: formatted,
  //   //   recording: false
  //   // });
  // }

  getAudioContext =  () => {
    AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContent = new AudioContext();
    return audioContent;
  };

  record = () =>{
    window.navigator.getUserMedia({ audio:true }, (stream) => {
        const audioContext = this.getAudioContext();
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
          const {socket} = this.state;
          socket.emit('audioSend', e.inputBuffer.getChannelData(0));
          // this.play(e.inputBuffer.getChannelData(0));
        };
    }, console.log);
}

  render() {
    // const { recording, stream } = this.state;

    // Don't show record button if their browser doesn't support it.
    // if (!stream) {
    //   return null;
    // }

    return (
      <>
      <button
        onClick={() => {
          this.record();
        }}
        >
        Start recording
      </button>
      <br />
      {/* <ReactAudioPlayer
        src={this.state.blobFormatted}
        controls
      /> */}
      </>
    );
  }
}

export default RecorderStream;
