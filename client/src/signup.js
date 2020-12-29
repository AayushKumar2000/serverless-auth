import instance  from './axiosInstance'

import googleIcon from './search.png'
import React,{useState} from 'react';

const api_url= `${process.env.REACT_APP_API_GATEWAY_URL}`;



function SignUp() {

const [username,setUsername] = useState("")
const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [err,setErr] = useState(null)




const handleSubmit=(event)=>{
  event.preventDefault();
  console.log(username,email,password);

  const data={username,email,password};
  instance.post(`${process.env.REACT_APP_API_GATEWAY_URL}/username_password-signup`,data).then((response)=>{
    if(response.data && response.data.err == 'user already exist')
     setErr('user_already_exist')

  });
}
  return (
   <div className="container">
    <div className="container__center">
     <div className="signup">
       <div className="signup__heading">
        <div className="signup__heading-text">Sign Up</div>
       </div>
       <div className="signup__container">
         <div className="email-passowrd">

           <form  onSubmit={(event)=>handleSubmit(event)}className="email-passowrd__form">
             <input  onChange={(event)=>setUsername(event.target.value)} value={username} required type="text" className="email-passowrd__form-username" placeholder="username"/><br/>
             <input  onChange={(event)=>setEmail(event.target.value)} value={email} required type="email" className="email-passowrd__form-email" placeholder="email"/><br/>
             <input  onChange={(event)=>setPassword(event.target.value)} value={password} required type="password" className="email-passowrd__form-password" placeholder="password" /><br/>
               <div className="email-passowrd__form-err">{err == 'user_already_exist'? 'user already exist':null}</div>
             <input type="submit" style={{marginTop:'2rem'}}className="email-passowrd__form-submit signup__submitbutton"  value="Sign Up" />
           </form>

           </div>

         <div className="socialLogins">
           <div className="socialLogins-heading"><p>Or Sign up with</p></div>
           <a href={`${api_url}/auth/google`} className="socialLogins__google">
             <img src={googleIcon} className="socialLogins__google-image"/>
             <div className="socialLogins__google-text">Google</div>
           </a>
         </div>
       </div>
     </div>

    </div>
  </div>
  );
}

export default SignUp;
