var net = require('net');
var crypto = require('crypto');
var process = require('process');

SERV_PORT = 3001

const makeNonce = (size)=>{ // makes challenge and symmetric key
    var timestamp = new Date().getTime().toString();
    var pid = process.pid.toString();
    var key = [...crypto.createHash('sha256').update(pid+timestamp).digest()]; // key length : 256/8 = 32
    const N = 256;  

    // RC4 init
    var s = new Array(N);
    for(var i=0;i<N;i++){
        s[i] = i;
    }
    var i,j = 0;
    for(i=0;i<N;i++){
        j = (j+s[i]+key[i%key.length])%N;
        [s[i],s[j]] = [s[j],s[i]];
    }

    //makeByte
    var ret = '';
    i = j = 0;
    size/=8;    //bit to byte(2^8 == 256)
    for(var t=0;t<size;t++){
        i = (i+1)%N;
        j = (j+s[i])%N;
        [s[i],s[j]] = [s[j],s[i]];
        var k = s[(s[i]+s[j])%N];
        ret+=(parseInt(k/16).toString(16)+(k%16).toString(16)); //toHex(4bit + 4bit)
    }
    return ret;
}

var server = net.createServer(socket=>{
    console.log(`client IP : ${socket.address().address} PORT : ${socket.remotePort}`);

    socket.on('data',(data)=>{
        if(data.toString() == "I need a token"){
            var challenge = makeNonce(128);
            socket.write(challenge);
        }
    });
    socket.on('close',()=>console.log('client disconntected'));
    socket.write('welcome to AS');
});

server.on('error',(err)=>{
    console.log(err)}
);

server.listen(SERV_PORT,()=>{
    console.log(`listening in ${SERV_PORT}`);
});