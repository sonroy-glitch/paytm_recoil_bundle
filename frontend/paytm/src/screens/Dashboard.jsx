import React from 'react'
import {useNavigate} from "react-router-dom"
const Dashboard = () => {
  const navigate=useNavigate()
  return (
    <div className="flex flex-col items-center justify-center ">
      <div className="flex flex-row items-center justify-center">
       <p>Payment Dashboard</p>
       <button></button>
       <button></button>
       <button onClick={()=>{
 localStorage.removeItem("auth");
 navigate("/")
      }}>Signout</button>
      </div>
      <div>

      </div>
      
    </div>
  )
}

export default Dashboard