import React from 'react'
import "./LoginForm.css"
import { FaUser , FaLock , FaEye} from "react-icons/fa";


const LoginForm = () => {
  return (
    <div className="wrapper">
        <form action="">
            <h1>
                Login
            </h1>
            <div className="input-box">
                <input type="text" placeholder='Username' />
                <FaUser className='icon' />
            </div>
            <div className="input-box">
                <input type="password" placeholder='Password' />
                <FaEye  className='icon' />
             </div>
            <button>
                Login
            </button>
        </form>
    </div>
  )
}

export default LoginForm