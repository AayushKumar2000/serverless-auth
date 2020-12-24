

const AWS = require("aws-sdk");
const jwt = require('jsonwebtoken');

const kms = new AWS.KMS();

var params = {
  KeyId: process.env.kms_KeyID
};


function generatePolicy(effect,resource){
 return  {
	"principalId": "my-username",
	"policyDocument": {
		"Version": "2012-10-17",
		"Statement": [
			{
				"Action": "execute-api:Invoke",
				"Effect": `${effect}`,
				"Resource": `${resource}`
			}
		]
	}
}
 
}



exports.handler =  (event,context,callback) => {
 console.log("event "+event)
    
   try{
  //const token = event.authorizationToken;
  const token = event.headers.authorization;
  const fid = event.queryStringParameters.fingerprintID
   console.log(token)
    if(token == undefined)
     callback("Unauthorized")
     
  var TokenArray = token.split(" ");
   
   console.log(TokenArray)
   
   if(TokenArray[1] == "" && TokenArray[0]== 'Bearer' )
   callback("Unauthorized")

console.log("jwt-token "+TokenArray[1]);

 kms.getPublicKey(params, function(err, data) {
  if (err){ 
      console.log(1)
  console.log("e1 "+err, err.stack); // an error occurred
   throw "Error: Internal Server Error"
  }else {  
      console.log(data);   
      var key = (data.PublicKey).toString('base64');
       key = '\n-----BEGIN PUBLIC KEY-----\n'+key+'\n-----END PUBLIC KEY-----';
       console.log(key)
        jwt.verify(TokenArray[1],key, { algorithms: ['RS256'] , issuer: 'aws-apiGateway-fileSharing200', fingerprintID: fid}, function (err, payload) {
	  if(err){
        console.log("e2"+err)
      // callback(null, generatePolicy('Deny',event.methodArn));
      callback("Unauthorized")
      }else{
       console.log(payload) 
       callback(null,generatePolicy('Allow',event.methodArn));
    }
	          
            
            
        });
    
    
   
   
 }});
 
 
   } catch (e) {
       console.log("e3"+e)
	   callback(e);
   }
   
     
	
     

   }
