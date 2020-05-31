var net = require('net');
var crypto = require('crypto');
var process = require('process');
var fs = require('fs');
var cryptoFuntions = require('../crytoFunctions');
const {
    cryptoHashbase64, 
    makeNonce,
    encryptPub, 
    decryptPub, 
    encryptPri, 
    decryptPri, 
    base64Encoding, 
    base64Decoding
} = cryptoFuntions;

SERV_PORT = 3001

var puAS = fs.readFileSync('public.pem');
var prCA = fs.readFileSync('./CA/private.pem');

var server = net.createServer(socket=>{
    console.log(`client IP : ${socket.address().address} PORT : ${socket.remotePort}`);

    socket.on('data',(data)=>{
        if(data.toString() == "I need a token"){
            var challenge = makeNonce(128);
            var stringAuthServer = `Auth Server`;
            var puASbase64 = puAS.toString('base64');
            var S = encryptPri(prCA,cryptoHashbase64(stringAuthServer+puASbase64));
            var certificate = [stringAuthServer,puASbase64,S].join(',');
            var res = [challenge,certificate].join(',');
            socket.write(res);
        }
    });
    socket.on('close',()=>console.log('client disconntected'));
});

server.on('error',(err)=>{
    console.log(err)}
);

server.listen(SERV_PORT,()=>{
    console.log(`listening in ${SERV_PORT}`);
});