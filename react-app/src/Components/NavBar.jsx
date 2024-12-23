import React from 'react'
import './NavBar.css'
import logo from '../assets/logo.png'

const NavBar = () => {
  return (
    <div className='wrapper_nav'>
        <div className="logo">
            <img src={logo} alt="logo"  className='image'/>
            <h1 className='indus'>Anandham Industries</h1>
        </div>
    </div>
  )
}

export default NavBar