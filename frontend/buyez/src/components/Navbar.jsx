import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div>
        <div className='flex justify-between items-center my-5 mx-15'>
          <div><img src="buyez" alt="Loading"/></div>
          <div className='flex justify-center gap-8'> 
          <ul><Link to='/'>Home</Link></ul>
        <ul><Link to='/About'>About</Link></ul>
        <ul>Explore</ul>
        <ul></ul>
        </div>

        <div>
          <button>Login/Sign up</button>
        </div>
      
        </div>
       
    </div>
  )
}

export default Navbar