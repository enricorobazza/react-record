import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import socketIOClient from "socket.io-client";

export default class Listener extends Component {

    constructor(props) {
        super(props);
        this.state = {
          socket: null,
          blob: null
        };
      }

    async componentDidMount() {
        const socket = socketIOClient("http://192.168.0.31:8000");
        this.setState({socket});

        socket.on('audioSend', message => {
            //alert('received');
            console.log(message);
            var blob = new Blob([message], {type: 'audio/uav'});
            this.setState({blob: window.URL.createObjectURL(blob)});
        });
    }

  render() {
    return (
        <>
            {this.state.blob ? <h1>Listen to Audio:</h1> : <h1>Waiting for Audio.</h1>}
            <br />
            {this.state.blob && <ReactAudioPlayer
                src={this.state.blob}
                controls
                autoplay = {true}
                onCanPlay={(event)=>{
                    event.target.play();
                    //alert('loaded');
                    //console.log(event.target);
                }}
            />}
      </>
    );
  }
}
