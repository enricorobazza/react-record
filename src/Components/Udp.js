import React from 'react';
import dgram from 'dgram';

function Udp(){
    var PORT = 41234;
    var HOST = '127.0.0.1';

    var dgram = require('dgram');
    var message = new Buffer('My KungFu is Good!');

    var client = dgram.createSocket('udp4');
    client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + HOST +':'+ PORT);
    client.close();
    });

    return(
        <>
            UDP
        </>
    );
}

export default Udp;