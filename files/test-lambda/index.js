exports.handler =  (event,context,callback) => {
    // TODO implement
  const res={
	  statusCode: 200,
	  headers:{
		  "access-control-allow-origin":"http://localhost:3000",
		  "access-control-allow-credentials":"true"
	  },
	  body: JSON.stringify("successfull!")
  }
 callback(null,res)
};
