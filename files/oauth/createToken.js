const AWS = require("aws-sdk");
const kms = new AWS.KMS();
const util = require('util')

const base64url = require("base64url");
const keyId = process.env.kms_KeyID

async function sign(headers, payload, key_arn) {

    payload.iat = Math.floor(Date.now() / 1000);

    payload.exp = payload.iat + ( process.env.jwt_expire * 60)

    let token_components = {
        header: base64url(JSON.stringify(headers)),
        payload: base64url(JSON.stringify(payload)),
    };

    let message = Buffer.from(token_components.header + "." + token_components.payload)

    let res = await kms.sign({
        Message: message,
        KeyId: keyId,
        SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256',
        MessageType: 'RAW'
    }).promise()

    token_components.signature = res.Signature.toString("base64")
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

    return token_components.header + "." + token_components.payload + "." + token_components.signature;

}

var header = {
  "alg": "RS256",
  "typ": "JWT"
}

const create = async (username,fid) =>{
    console.log("fid "+fid)
      
    var payload = {
     username,
     iss:"apiGateway-serverless-auth",
     fingerprintID:fid
 }
 
 let token = await sign(header, payload, keyId)
  console.log(`JWT token: [${token}]`)
    
    return token;
}


module.exports = {create}