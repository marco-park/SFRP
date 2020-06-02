var net = require('net');
var readline = require('readline');
var crypto = require('crypto');
var fs = require('fs');
var puCA = fs.readFileSync('./AS/CA/public.pem');
var cryptoFuntions = require('./crytoFunctions');
const {
    cryptoHashbase64, 
    makeNonce,
    encryptPub, 
    decryptPub, 
    encryptPri, 
    decryptPri, 
    base64Encoding, 
    base64Decoding,
    aesDecrypt,
    aesEncrypt,
} = cryptoFuntions;

const ID = 'alice';
const password = 'doffltm!';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client = net.connect({port:3001, host:'127.0.0.1'}, ()=>{
    console.log('Client connected');
});

rl.on('line', line=> {
    client.write(line,listen1);
  })
  .on('close', function () {
    process.exit();
});

const listen1 = client.on('data',(data)=>{
    var res = (data.toString()).split(',');
    var challenge = res[0];
    var authServerStrging = res[1];
    var puAS = res[2];
    var S = res[3];
    var decryptS = decryptPub(puCA,S);
    var hashS = cryptoHashbase64(authServerStrging+puAS);
    console.log(authServerStrging,puAS);
    console.log(`S : ${S}`);
    console.log(`dcrtS : ${decryptS}`);
    console.log(`hashS : ${hashS}`);

    //verify S
    if(decryptS==hashS){   
        var K1 = makeNonce(256);
        console.log(`K1 : ${K1}`);
        var encryptK1 = encryptPub(base64Decoding(puAS),K1);
        console.log(`encryptK1 : ${encryptK1}`);
        
        var idblock = ID;
        var idLen = ID.length;
        var asc255 = String.fromCharCode(255);
        while(idblock.length!=15)idblock+=asc255;
        idblock+=idLen.toString(16);
        var result = aesEncrypt(K1,idblock+cryptoHashbase64(password)+challenge);
        client.write([encryptK1,result].join(','));
    }
})

client.on('end',()=>{
    console.log('Client disconnected..');   
})