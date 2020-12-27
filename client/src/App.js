import React,{useState,useEffect} from 'react';
import Login from './login';
import Home from './home';
import SignUp from './signup';
import history from './history';
import {Route,Router} from 'react-router-dom';
import './main.scss';



function App() {
  return (
    <div  >
     <Router  history={history}>
    <Route path="/" exact component={Home}/>
    <Route path="/login" exact component={Login}/>
    <Route path="/signup" exact component={SignUp}/>
   </Router>
    </div>
  );
}

export default App;
