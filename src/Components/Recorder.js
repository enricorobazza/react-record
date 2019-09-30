import React, { Component } from 'react';
import RecorderJS from 'recorder-js';
import ReactAudioPlayer from 'react-audio-player';
import socketIOClient from "socket.io-client";

import { getAudioStream, exportBuffer } from '../utilities/audio';

class Recorder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      stream: null,
      recording: false,
      recorder: null,
      blob: null,
      socket: null
    };
    this.startRecord = this.startRecord.bind(this);
    this.stopRecord = this.stopRecord.bind(this);
  }

  async componentDidMount() {
    const socket = socketIOClient("http://192.168.1.154:8000");
    this.setState({socket});

    let stream;

    try {
      stream = await getAudioStream();
    } catch (error) {
      // Users browser doesn't support audio.
      // Add your handler here.
      console.log(error);
    }

    this.setState({ stream });
  }

  startRecord() {
    const { stream } = this.state;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const recorder = new RecorderJS(audioContext);
    recorder.init(stream);

    this.setState(
      {
        recorder,
        recording: true
      },
      () => {
        recorder.start();
      }
    );
  }

  async stopRecord() {
    const { recorder } = this.state;

    const { blob, buffer } = await recorder.stop()
    //const audio = exportBuffer(buffer[0]);

    // Process the audio here.
    //console.log(audio);
    console.log(blob);
    //RecorderJS.download(blob, 'my-audio-file');

    const {socket} = this.state;
    socket.emit('audioSend', blob);

    this.setState({
      recording: false,
      blob: window.URL.createObjectURL(blob)
    });
  }

  render() {
    const { recording, stream } = this.state;

    // Don't show record button if their browser doesn't support it.
    if (!stream) {
      return null;
    }

    return (
      <>
      <button
        onClick={() => {
          recording ? this.stopRecord() : this.startRecord();
        }}
        >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
        <br />
        <br />
      <ReactAudioPlayer
        src={this.state.blob}
        controls
      />

      </>
    );
  }
}

export default Recorder;
