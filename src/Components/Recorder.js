import React, { Component } from 'react';
import RecorderJS from 'recorder-js';
import ReactAudioPlayer from 'react-audio-player';
import socketIOClient from "socket.io-client";
import { IP } from '../config';
import styled from 'styled-components';


import { getAudioStream, exportBuffer } from '../utilities/audio';

class Recorder extends Component {

  Background = styled.div`
    background-color: #1abc9c;
    width: 100vw;
    height: 100vh;
    display:flex;
    padding: 30px;
    box-sizing: border-box;
    flex-direction:column;
    align-items: center;
  `;

  Title = styled.h1`
      color: #fff;
    `;

  Button = styled.button`
    border: none;
    padding: 15px 120px;
    background-color: #2c3e50;
    color: #fff;
    border-radius: 10px;
  `;


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
    const socket = socketIOClient(IP);
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
      <this.Background>
        <this.Title>Welcome to Hear Me Talk!</this.Title>
        <this.Button
          onClick={() => {
            recording ? this.stopRecord() : this.startRecord();
          }}
          >
          {recording ? 'Stop Recording' : 'Start Recording'}
        </this.Button>
          <br />
          <br />
        <ReactAudioPlayer
          src={this.state.blob}
          controls
        />
      </this.Background>
      </>
    );
  }
}

export default Recorder;
