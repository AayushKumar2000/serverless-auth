import axios from 'axios';
import axiosRetry from 'axios-retry';
var fingerprint = require('browser-fingerprint')()

const instance = axios.create({
  withCredentials: true,
  params:{
    fingerprintID:fingerprint
  }
})


instance.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error.response && error.response.status === 403 && error.response.data.redirect == '/' ) {
    window.location = '/'
  } else {
    return Promise.reject(error)
  }
})


instance.interceptors.response.use(
  res => res,
  err => {
   console.log(err)
    if ( err.response && err.response.status === 401  && err.response.data.message == 'Unauthorized') {
		console.log(401)
    console.log(err.response)

		instance(`${process.env.REACT_APP_API_GATEWAY_URL}/getAccessToken`, {
		method: "get"
	 }).then((res)=>{
     if(res.data){
     console.log(res.data.jwt_token)
     localStorage.setItem('jwt_token',res.data.jwt_token );
   }
   })



    throw err;
    }
  else if (err.response && err.response.status === 401  && err.response.data.message == 'err:refresh-token-not-found') {
    console.log(err.response)

      window.location = '/login'

        throw err;
   }
		else {
 			 return err;
 	 }
  }
);



axiosRetry(instance, {retries: 3,shouldResetTimeout: true, retryCondition	: (error)=>{
	return error.response && error.response.status === 401 && error.response.data.message == 'Unauthorized'  ;


}, retryDelay: (retryCount: 5) => {
                    return retryCount * 3000;
                }});


export default instance;
