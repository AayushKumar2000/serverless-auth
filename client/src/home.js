import React,{useState,useEffect} from 'react';
import instance  from './axiosInstance'
var fingerprint = require('browser-fingerprint')()


instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem('jwt_token');
    if(token)
  config.headers.Authorization =  token ? `Bearer ${token}` : '';

    return config;

  });




function Home() {

const [result,setResult]=useState(null);
const [user,setUser]=useState(null);

useEffect(()=>{
  instance(`${process.env.REACT_APP_API_GATEWAY_URL}/getAccessToken`, {
  method: "get"
 }).then((res)=>{
    if(res.data){
    console.log(res.data.jwt_token)
    localStorage.setItem('jwt_token',res.data.jwt_token );

  }
  })

  instance(`${process.env.REACT_APP_API_GATEWAY_URL}/user`, {
  method: "get"
 }).then((res)=>{
    if(res.data){
    console.log(res.data)
    setUser(res.data);
  }
  })


},[])

	const login = () =>{
    setResult(null);
		instance(`${process.env.REACT_APP_API_GATEWAY_URL}/test`, {
  method: "get",
	 withCredentials: true
  }).then((res)=>{
  if(res)
 console.log("res "+res.data);
 setResult(res.data);

})
	}


  return (
    <div >
			    <div className="button button__authorised-access" onClick={()=>login()}>authorised access</div>
          <a className="button" onClick={()=>{localStorage.removeItem("jwt_token")}} href={`${process.env.REACT_APP_API_GATEWAY_URL}/logout`}>logout</a><br/>
          <div className="username">Name: {user?user.name:null}</div>
          <div className="useremail">Email: {user?user.email:null}</div>
          <div className="authorised-result">{result}</div>

    </div>
  );
}

export default Home;
