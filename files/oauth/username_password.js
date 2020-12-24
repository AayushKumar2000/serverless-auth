

module.exports =(app,token,dynamodb,randomString)=>{
    
    app.post('/username_password-login',(req,res)=>{
                 const x = new Date();
     x.setDate(new Date().getDate()+30)
          const rid = randomString(8)
          
        console.log(req.body);
           const params = {
         TableName:`${process.env.db_name}`,
         ExpressionAttributeValues: {
           ":e": {S: ""+req.body.email } } ,
 
        FilterExpression: "email = :e"
     }
         dynamodb.scan(params, function(err, data) {
      if (err)
        console.log(err, err.stack); 
      else
      {
         if(data.Count != 0){
             if(data.Items[0].password && data.Items[0].password.S == req.body.password ){
                    const params = {
                     TableName:`${process.env.db_name}`,
                     ExpressionAttributeNames: {
                     "#RT": "refreshToken" },
                     ExpressionAttributeValues: {
                       ":t": {S: ""+rid }  },
                       Key: {
                          "userID": { S: data.Items[0].userID.S }
                           },
                      UpdateExpression: "SET  #RT = :t"
                    }
     
      dynamodb.updateItem(params, function(err, data2) {
       if (err)
       console.log(err, err.stack); // an error occurred
        else{
        console.log(data)
            res.cookie('refresh-token',rid,{ httpOnly: true, path:'/', expires:x ,secure: true , sameSite: 'None'})
               res.cookie('uid',data.Items[0].userID.S,{ httpOnly: true, path:'/', expires:x ,secure: true , sameSite: 'None'})
                       res.send(403,{"redirect":'/'})
      }})
              
             }else{
                res.send({"err":"password does not match"})
             }
             
         }else{
              res.send({"err":"user not found"})
         }
         
        
      }
             
         })
         
       
    })
    
     app.post('/username_password-signup',(req,res)=>{
            const x = new Date();
            const id = x.getTime()
     x.setDate(new Date().getDate()+30)
          const rid = randomString(8)
           console.log(req.body.username,req);
           
             console.log(req.body);
           const params = {
         TableName:`${process.env.db_name}`,
         ExpressionAttributeValues: {
           ":e": {S: ""+req.body.email } } ,
 
        FilterExpression: "email = :e"
     }
         dynamodb.scan(params, function(err, data) {
      if (err)
        console.log(err, err.stack); 
      else
      {
          if(data.Count == 0){
                   const user = {
                 TableName: `${process.env.db_name}`,
                 Item:{
                     "userID":{
                         "S":""+id,
                        },
                     "userName":{
                         "S": req.body.username,
                     },
                     "email" :{
                         "S": req.body.email
                     },
                     "refreshToken" :{
                         "S":""+ rid
                     },"password" :{
                         "S":""+ req.body.password
                     }
                     
              }}
                   dynamodb.putItem(user, function(err, data) {
             if (err) 
             console.log(err, err.stack); // an error occurred
             else {
               res.cookie('refresh-token',rid,{ httpOnly: true, path:'/', expires:x ,secure: true , sameSite: 'None'})
               res.cookie('uid',id,{ httpOnly: true, path:'/', expires:x ,secure: true , sameSite: 'None'})
                       res.send(403,{"redirect":'/'})

            }})
            
        }else{
            res.send({"err":"user already exist"})
        }
      }
           
           
           

     
              
      
    })
        
    
     })
    
}
