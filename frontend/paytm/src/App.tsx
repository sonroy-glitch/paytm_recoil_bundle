import React from 'react'
import {Routes,Route} from "react-router-dom"
import Home from "./screens/Home.jsx"
import Dashboard from "./screens/Dashboard.jsx"


const App = () => {
  return (
   <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/dashboard" element={<Dashboard/>}/>
</Routes>
  )
}

export default App