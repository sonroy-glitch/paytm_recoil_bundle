import React,{useState,useRef,useEffect} from 'react'
import {stateAtom} from "../atoms/state.jsx"
import {closeAtom} from "../atoms/state.jsx"
import axios from "axios"
import {useNavigate} from "react-router-dom"
import {useRecoilValue,useRecoilState} from "recoil"
import LoadingBar from "react-top-loading-bar"
var interval;
const Render = () => {
   const state = useRecoilValue(stateAtom)
   const [close,setClose] = useRecoilState(closeAtom)
   const [message,setMessage]=useState("")
   const [username,setUsername]=useState("")
   const [email,setEmail]=useState("")
   const [password,setPassword]=useState("")
   const [pin,setPin]=useState("")
   const [data,setData]=useState("")
   const ref =useRef(null)
   const navigate=useNavigate()
  //  console.log(state)
   function run(){
    setClose(true)
   }
   useEffect(() => {
     if(message!==""){
      setTimeout(() => {
        setMessage("")
      }, 5000);
     } 
    
   }, [message])
   useEffect(() => {
      var auth=localStorage.getItem("auth")
      if(auth!==null){
        //do a jsonwebtoken verifiaction here
        navigate("/dashboard")
      }
     
   }, [])
   
  function usernameDebouncing(e){
    clearTimeout(interval)
    interval = setTimeout(() => {
      setUsername(e)
    },1000)
   }
    function emailDebouncing(e){
    clearTimeout(interval)
    interval = setTimeout(() => {
      setEmail(e)
    },1000)
   }
   function passwordDebouncing(e){
    clearTimeout(interval)
    interval = setTimeout(() => {
      setPassword(e)
    },1000)
   }
   function pinDebouncing(e){
    clearTimeout(interval)
    interval = setTimeout(() => {
      setPin(e)
    },1000)
   }
   function dataDebouncing(e){
    clearTimeout(interval)
    interval = setTimeout(() => {
      setData(e)
    },1000)
   }
   async function signup(){
    ref.current.continuousStart()
    var data = await axios.post("http://localhost:3000/signup",{
      username,
      email,
      password,
      pin
    }) 
    setMessage(data.data)
    ref.current.complete()
    
   }
 
   async function login(){
    console.log(ref.current)

    // ref.current.continuousStart()
    var data = await axios.post("http://localhost:3000/signin",{
      data,
      password,
      
    }) 
    if(data.status== 200){
    localStorage.setItem("auth",data.data)
    navigate("/dashboard")
    }
    else if(data.status==202){
      setMessage(data.data)
    }
    else{
      setMessage("Something went wrong")
    }
    // ref.current.complete()
   }
   if(state==="signup"&& !close){
    return(
      <div className="flex flex-col bg-stone-600 p-2 rounded-lg items-center justify-center">
        <LoadingBar color="red" ref={ref}/>
        <div className="flex flex-row">
        
        <div className="items-center justify-center mb-1 ">
        <h3 >SignUp</h3>

        </div>
        <div >
          <button className="bg-slate-50 rounded-md text-sm " onClick={run}>Close</button>
        </div>
</div>
        <div className="items-center justify-center mb-1 rounded-lg">
          <input placeholder="Username" type='text' className="rounded-md" onChange={(e)=>usernameDebouncing(e.target.value)}/>
        </div>
        <div className="items-center justify-center mb-1">
        <input placeholder="Email" type='email' className="rounded-md" onChange={(e)=>emailDebouncing(e.target.value)}/>
          
        </div>
        <div className="items-center justify-center mb-1">
        <input placeholder="Password" type='password'className="rounded-md" onChange={(e)=>passwordDebouncing(e.target.value)}/>

        </div>
        <div className="items-center justify-center mb-1">
        <input placeholder="Pin" type='password'className="rounded-md"onChange={(e)=>pinDebouncing(e.target.value)}/>

        </div>
        <div className="items-center justify-center mb-1">
          <button className="bg-slate-50 rounded-md text-sm " onClick={signup}>SignUp</button>
        </div>
         <div>
          <p>{message}</p>
         </div>
      </div>
    )
   }
   else if(state==="signin" && !close){
    return(
      <div className="flex flex-col bg-stone-600 p-2 rounded-lg items-center justify-center">
        <div className="items-center justify-center mb-1">
        <div className="flex flex-row">
        
        <div className="items-center justify-center mb-1 ">
        <h3 >Signin</h3>

        </div>
        <div >
          <button className="bg-slate-50 rounded-md text-sm " onClick={run}>Close</button>
        </div>
</div>
        </div>
        <div className="items-center justify-center mb-1 rounded-lg">
          <input placeholder="Username or Email" type='text' className="rounded-md" onChange={(e)=>dataDebouncing(e.target.value)}/>
        </div>
        
        <div className="items-center justify-center mb-1">
        <input placeholder="Password" type='password'className="rounded-md" onChange={(e)=>passwordDebouncing(e.target.value)}/>

        </div>
        
        <div className="items-center justify-center mb-1">
          <button className="bg-slate-50 rounded-md text-sm " onClick={login}>SignIn</button>
        </div>
         <div>
          <p>{message}</p>
         </div>
      </div>
    )
   }
}

export default Render