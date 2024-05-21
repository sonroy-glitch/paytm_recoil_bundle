import React, { useEffect } from 'react';
import Render from "../components/Render.jsx";
import { stateAtom,closeAtom } from "../atoms/state.jsx";
import { useSetRecoilState ,useRecoilState} from "recoil";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const navigate=useNavigate()
  const setState = useSetRecoilState(stateAtom);
  const [close,setClose] = useRecoilState(closeAtom)
 

return (
    <div className="flex flex-col items-center justify-center z-0">
      <div className="flex flex-row justify-around text-sm bg-teal-600 fixed inset-x-0 top-0">
        <div>Paytm Logo</div>
        <div>Paytm for Customer</div>
        <div>Paytm for Business</div>
        <div>Investor Relations</div>
        <div>Career</div>
        <div>Company</div>
        <div>
          <button className="bg-red-500 rounded-md"onClick={()=>{
            setState("signup")
             setClose(false)
            }}>Signup</button>
        </div>
        <div>
          <button className="bg-red-500 rounded-md" onClick={()=>{setState("signin");setClose(false);
             
          }}>Signin</button>
        </div>
      </div>
      <div className="flex absolute top-8 items-center justify-center inset-x-0">
        <div>Paytm Body</div>
      </div>
      <div className="flex fixed bottom-20 z-10">
        <Render />
      </div>
    </div>
  );
}

export default Home;
