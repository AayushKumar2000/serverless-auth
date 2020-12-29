import instance  from './axiosInstance'
import googleIcon from './search.png';
import React,{useState} from 'react';


const api_url= `${process.env.REACT_APP_API_GATEWAY_URL}`;

instance.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error.response && error.response.status === 403 && error.response.data.redirect == '/' ) {
    window.location = '/'
  } else {
    return Promise.reject(error)
  }
})

function Login() {
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [err,setErr] = useState(null)




  const handleSubmit=(event)=>{
    event.preventDefault();
    console.log(email,password);

    const data={email,password};
    instance.post(`${process.env.REACT_APP_API_GATEWAY_URL}/username_password-login`,data).then((response)=>{
      if(response.data&&response.data.err == 'user not found')
       setErr('user_not_found')
      if(response.data&&response.data.err == 'password does not match')
       setErr('password_does_not_match')
    });
  }


  return (
  <div className="container">
   <div className="container__center">
     <div className="login">
       <div className="login__heading">
        <div className="login__heading-text">Login</div>
       </div>
       <div className="login__container">
         <div className="email-passowrd">

         <form  onSubmit={(event)=>handleSubmit(event)}className="email-passowrd__form">
            <input  onChange={(event)=>{setEmail(event.target.value);  setErr(null)}} value={email} required type="email" className="email-passowrd__form-email" placeholder="email"/><br/>
             <div className="email-passowrd__form-err">{err == 'user_not_found'? 'user not found':null}</div>
            <input  onChange={(event)=>{setPassword(event.target.value);  setErr(null)}} value={password} required type="password" className="email-passowrd__form-password" placeholder="password" /><br/>
              <div className="email-passowrd__form-err">{err == 'password_does_not_match'? 'password does not match':null}</div>
             <a className="email-passowrd__form-forgotpassword">Forgot Password?</a><br/>
             <input type="submit" className="email-passowrd__form-submit" value="Login" />

           </form>

           </div>

         <div className="socialLogins">
           <div className="socialLogins-heading"><p>Or login with</p></div>
           <a href={`${api_url}/auth/google`} className="socialLogins__google">
             <img src={googleIcon} className="socialLogins__google-image"/>
             <div className="socialLogins__google-text">Google</div>
           </a>
         </div>
         <div className="login__container-signup">
           Not a Member?<a href="/signup" className="login__container-signup-link"> Signup</a>
         </div>
       </div>
     </div>

    </div>
  </div>
  );
}

export default Login;
