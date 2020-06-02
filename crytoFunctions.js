var crypto = require('crypto');

const AES256CBC = 'aes-256-cbc';
const SHA256 = 'sha256';
const BASE64 = 'base64';
const UTF8 = 'utf8';

exports.cryptoHashbase64 = (data)=>{
    return crypto.createHash(SHA256).update(data).digest(BASE64);
}

exports.makeNonce = (size)=>{ // makes challenge and symmetric key
    var timestamp = new Date().getTime().toString();
    var pid = process.pid.toString();
    var key = [...crypto.createHash(SHA256).update(pid+timestamp).digest()]; // key length : 256/8 = 32
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
    ret = Buffer.from(ret, 'hex').toString('base64'); //hex to base64
    return ret;
}

exports.aesEncrypt = (key, data)=>{
    const cipher = crypto.createCipher(AES256CBC, key);
    var result = cipher.update(data,UTF8, BASE64);
    result+=cipher.final(BASE64);
    return result;
}

exports.aesDecrypt = (key, data)=>{
    const cipher = crypto.createDecipher(AES256CBC, key);
    var result = cipher.update(data,BASE64,UTF8);
    result+=cipher.final(UTF8);
    return result;
}

exports.base64Encoding = (data)=>{
    return Buffer.from(data,UTF8).toString(BASE64);
}

exports.base64Decoding = (data)=>{
    return Buffer.from(data,BASE64).toString(UTF8);
}

exports.encryptPub = (key,data)=>{
    return crypto.publicEncrypt(key,Buffer.from(data,BASE64)).toString(BASE64);
}

exports.decryptPub = (key,data)=>{
    return crypto.publicDecrypt(key,Buffer.from(data,BASE64)).toString(BASE64);
}

exports.encryptPri = (key,data)=>{
    return crypto.privateEncrypt(key,Buffer.from(data,BASE64)).toString(BASE64);
}

exports.decryptPri = (key,data)=>{
    return crypto.privateDecrypt(key,Buffer.from(data,BASE64)).toString(BASE64);
}