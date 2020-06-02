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
    base64Decoding,
    aesDecrypt,
    aesEncrypt,
} = cryptoFuntions;

SERV_PORT = 3001

var puAS = fs.readFileSync('public.pem');
var prAS = fs.readFileSync('private.pem');
var prCA = fs.readFileSync('./CA/private.pem');

var db = [
    {
        id : 'alice',
        password : 'dD40H4Y0NhsZM7tOvxbasCFY76CbaNudT51sdupXJfQ=' //hash(pw)
    }
]

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
            socket.on('data',(data)=>{
                var res = (data.toString()).split(',');
                var K1 = decryptPri(prAS,res[0]);
                console.log(`encrypted K1 : ${res[0]}`);
                console.log(`decrypt K1 : ${K1}`);
                var result = aesDecrypt(K1,res[1]);
                var idLen = parseInt('0x'+result[15]);  //hex
                var ID = result.substr(0,idLen);
                resultrest = result.substring(16);
                resultrest = resultrest.split('=');
                var passwordHash = resultrest[0]+'=';
                var challengeres = resultrest[1]+'=';
                console.log(`encrypt IDPWC : ${res[1]}`);
                console.log(`decryptId : ${result.substr(0,16)}`);
                console.log(`passwordHashres : ${passwordHash}`);
                console.log(`challengeres : ${challengeres}`);
                console.log(`challengeori : ${challenge}`);
                if(challengeres == challenge){
                    console.log('challenge verified');
                    db.map(v=>{
                        if(v.id == ID && v.password == passwordHash){
                            console.log(`${ID} : id,pw verified`);
                        }
                    })
                }
            });
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