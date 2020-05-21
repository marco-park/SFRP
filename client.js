const net = require('net');
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client = net.connect({port:3001, host:'127.0.0.1'}, ()=>{
    console.log('Client connected');
});

rl.on('line', line=> {
    client.write(line);
  })
  .on('close', function () {
    process.exit();
});

client.on('data',(data)=>{
    console.log(data.toString());
})

client.on('end',()=>{
    console.log('Client disconnected..');
})