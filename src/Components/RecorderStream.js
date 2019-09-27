import React, { Component } from 'react';
import RecorderJS from 'recorder-js';

import { getAudioStream, exportBuffer } from '../utilities/audio';

class RecorderStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stream: null,
      recording: false,
      recorder: null
    };
    this.startRecord = this.startRecord.bind(this);
    this.stopRecord = this.stopRecord.bind(this);
  }

  async componentDidMount() {
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

  startRecord(){
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
          this.record();
        }
      );
  }

  record(){
      const {recorder} = this.state;
      recorder.start();
      var interval = setInterval(()=>{
        recorder.stop().then((response)=>{
            if(this.state.recording) {
                console.log(response.blob);
                //RecorderJS.download(response.blob, 'my-audio-file');
                recorder.start();
            }
            else clearInterval(interval);
        });
      }, 1000);
  }


  async stopRecord() {
    const { recorder } = this.state;
    
    const { blob, buffer } = await recorder.stop()
    console.log(blob);

    this.setState({
      recording: false
    });
  }

  render() {
    const { recording, stream } = this.state;

    // Don't show record button if their browser doesn't support it.
    if (!stream) {
      return null;
    }

    return (
      <button
        onClick={() => {
          recording ? this.stopRecord() : this.startRecord();
        }}
        >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
    );
  }
}

export default RecorderStream;
