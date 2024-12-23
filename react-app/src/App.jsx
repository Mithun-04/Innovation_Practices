import React from 'react'
import LoginForm from './Components/LoginForm'
import NavBar from './Components/NavBar'
import "./App.css"

const App = () => {
  return (
    <div>
      <NavBar />
      <div className='mid'>
        <div className='para_div'>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolores repellat quis eum doloribus ducimus cumque quam id, quas, vel voluptatibus praesentium aliquam laborum repellendus sint, odit harum iusto placeat. Inventore.
          </p>
        </div>
      <LoginForm />
      </div>
    </div>
  )
}

export default App