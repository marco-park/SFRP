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
    base64Decoding
} = cryptoFuntions;

const ID = 'spark328123';
const password = 'sun3290!';

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
        var encryptK1 = encryptPub(base64Decoding(puAS),K1);
        console.log(`encryptK1 : ${encryptK1}`);
        
        const cipher = crypto.createCipher('aes-256-cbc', K1);
        var idblock = ID+(16-ID.length);
        idblock+=idblock;
        var asc255 = String.fromCharCode(255);
        var result = cipher.update(idblock, 'utf8', 'base64'); 
        console.log(result);
    }
})

client.on('end',()=>{
    console.log('Client disconnected..');   
})