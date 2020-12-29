const serverless = require('serverless-http');
const AWS = require("aws-sdk");
var dynamodb = new AWS.DynamoDB();
const express = require('express');
const token = require('./createToken')
const cors = require('cors')
require('./googlePassport');
const app = express();
const passport=require('passport');
const username_password =require('./username_password');
const randomString = require('./randomString');

app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
  origin: `${process.env.origin}`,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 200,
  credentials: true
}));

app.use(express.json());

username_password(app,token,dynamodb,randomString);

app.get('/auth/google/callback',
 passport.authenticate('google'),
 (req,res)=>{
   console.log("req"+req.user.email,req);
   
  const username = req.user.email;

  
   token.create(username).then((e)=>{
     console.log("in "+e);
   
     const x = new Date();
     x.setDate(new Date().getDate()+30)
     const rid = randomString(8);
     res.cookie('refresh-token',rid,{ httpOnly: true, path:'/', expires:x ,secure: true , sameSite: 'None'})
     res.cookie('uid',req.user.id,{ httpOnly: true, path:'/', expires:x ,secure: true , sameSite: 'None'})

     const params = {
         TableName:`${process.env.db_name}`,
         ExpressionAttributeNames: {
           "#RT": "refreshToken" },
         ExpressionAttributeValues: {
           ":t": {S: ""+rid }  },
         Key: {
           "userID": { S: req.user.id }
          },
        UpdateExpression: "SET  #RT = :t"
     }
     
      dynamodb.updateItem(params, function(err, data) {
       if (err)
       console.log(err, err.stack); // an error occurred
        else{
        console.log(data)
        res.redirect(`${process.env.redirect_url}`)
      }})
     
     
     
     
   })
   
  
  
 });
   
 app.get('/auth/google',
 passport.authenticate('google',{scope:['profile','email']}));
 
 
 
 app.get('/getAccessToken',(req,res)=>{
   console.log("req "+req.query.fingerprintID)
   if(req.headers.cookie ){
    const x = getCookie(req.headers.cookie,'refresh-token')
    const u = getCookie(req.headers.cookie,'uid')
   if( x != "" && u!= ""){
          const params={
      TableName:`${process.env.db_name}`,
      ExpressionAttributeValues: {
     ":v1":{
        S: ""+u
      }},
      KeyConditionExpression: "userID= :v1", 
    };
      
       dynamodb.query(params, function(err, data) {
      if (err)
        console.log(err, err.stack); 
      else
      {
       if(data.Count != 0 && data.Items[0].refreshToken.S == x){
         token.create(data.Items[0].email.S,req.query.fingerprintID).then((e)=>{
          const x = new Date();
     x.setDate(new Date().getDate()+30)
     const rid = randomString(8);
     res.cookie('refresh-token',rid,{ httpOnly: true, path:'/', expires:x ,secure: true , sameSite: 'None'})
     
              const params2 = {
         TableName:`${process.env.db_name}`,
         ExpressionAttributeNames: {
           "#RT": "refreshToken" },
         ExpressionAttributeValues: {
           ":t": {S: ""+rid }  },
         Key: {
           "userID":  { S: ""+u }
          },
        UpdateExpression: "SET  #RT = :t"
     }
     
      dynamodb.updateItem(params2, function(err, data) {
       if (err)
       console.log(err, err.stack); // an error occurred
        else{
        console.log(data)
         res.send({
           "jwt_token":e
          })
      }})
      
         
          
          
        })
       }else
         res.send(401,{"message":"err:refresh-token-not-found"});
       
      }
       })
    
   }else
        res.send(401,{"message":"err:refresh-token-not-found"});
   }
   else
        res.send(401,{"message":"err:refresh-token-not-found"});
   
 })
 
 function getCookie(cookie,cname) {
  var name = cname + "=";
  var decodedCookie = cookie;
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
 
 app.get('/logout',(req,res)=>{
  console.log(req)
  var flag = false;
  if(req.headers.cookie ){
    const x = getCookie(req.headers.cookie,'uid')
   if( x != ""){
      const params = {
         TableName:`${process.env.db_name}`,
         ExpressionAttributeNames: {
           "#RT": "refreshToken" },
         ExpressionAttributeValues: {
           ":t": {S: "" }  },
         Key: {
           "userID": {S: ""+x}
          },
        UpdateExpression: "SET  #RT = :t"
     }
     
       dynamodb.updateItem(params, function(err, data) {
       if (err)
       console.log(err, err.stack); // an error occurred
        else{
        console.log(data)
        
 
        res.cookie('refresh-token',"", {maxAge: 0});
        res.cookie('uid',"", {maxAge: 0});
        res.redirect(`${process.env.origin}/login`);
      }})
    
   }else
   flag = true;
  }
  else
   flag = true;
  
  if(flag){
  res.cookie('refresh-token',"", {maxAge: 0});
  
  res.redirect(`${process.env.origin}/login`)
  
  }
  
 })
 
 app.get('/redirect',(req,res)=>{
  res.redirect(`${process.env.origin}/login`);
 })


app.get('/user',(req,res)=>{
  const u = getCookie(req.headers.cookie,'uid');
  if(u!=""){
           const params={
      TableName: `${process.env.db_name}`,
      ExpressionAttributeValues: {
     ":v1":{
        S: ""+u
      }},
      KeyConditionExpression: "userID= :v1", 
    };
    
     dynamodb.query(params, function(err, data) {
      if (err)
        console.log(err, err.stack); 
      else
      {
        if(data.Count != 0){
         res.send({name:data.Items[0].userName.S, email:data.Items[0].email.S})
        }else
         res.send();
      }
      
     })
  }else
   res.send()
})

module.exports.handler = serverless(app);
