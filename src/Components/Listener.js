import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import socketIOClient from "socket.io-client";
import { IP } from '../config';
import styled from 'styled-components';

export default class Listener extends Component {

    constructor(props) {
        super(props);
        this.state = {
          socket: null,
          blob: null,
        };
      }


    Background = styled.div`
      background-color:#3498db;
      width: 100vw;
      height: 100vh;
      display:flex;
      padding: 30px;
      box-sizing: border-box;
      flex-direction:column;
    `;

    Title = styled.h1`
      color: #fff;
    `;

    async componentDidMount() {
        const socket = socketIOClient(IP);
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
            <this.Background>
            {this.state.blob ? <this.Title>Listen to Audio:</this.Title> : <this.Title>Waiting for Audio.</this.Title>}
            <br /><br />
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
            </this.Background>
      </>
    );
  }
}
