const AWS = require("aws-sdk");
var dynamodb = new AWS.DynamoDB();
const passport=require('passport');
const GoogleStrategy=require('passport-google-oauth20').Strategy;


passport.serializeUser((user,done)=>{
    console.log("serializeUser "+user);
    done(null,user)

})



                passport.use(new GoogleStrategy({
  clientID:process.env.clientID,
  clientSecret:process.env.clientSecret,
  callbackURL:"/dev/auth/google/callback",
    proxy:true
},
function (accessToken,refreshToken,profile,done) {
     
     console.log("profile "+profile.id)
     const params={
      TableName:`${process.env.db_name}`,
      ExpressionAttributeValues: {
     ":v1":{
        S: ""+profile.id
      }},
      KeyConditionExpression: "userID = :v1", 
      
  };
   
     dynamodb.query(params, function(err, data) {
      if (err)
        console.log(err, err.stack); 
      else
      {
         console.log("dynamodb5 "+data); 
        
         
         if(data.Count != 0)
         {
               console.log("dynamodb count "+data); 
               return done(null,{id:data.Items[0].userID.S,email:data.Items[0].email.S});
         }else{
             console.log("dynamodb count 0"+data); 
             const user = {
                 TableName: `${process.env.db_name}`,
                 Item:{
                     "userID":{
                         "S": profile.id,
                        },
                     "userName":{
                         "S": profile.displayName,
                     },
                     "email" :{
                         "S": profile._json.email
                     },
                     "refreshToken" :{
                         "S":""
                     }
                     
              }}
            
          dynamodb.putItem(user, function(err, data) {
             if (err) 
             console.log(err, err.stack); // an error occurred
             else {
             console.log("putItem "+data.Items);
             done(null,{id:user.Item.userID.S,email:user.Item.email.S});
            }})
              
      }
}
    
   
  }

)
}
));