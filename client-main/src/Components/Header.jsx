import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <div className="flex-1 p-1 bg-gray-800">
      <header className="flex flex-row justify-between items-center m-2">
        <div className="flex items-center">
          <Link to="/" className="mr-4 text-white text-sm sm:text-md cursor-pointer">
            Clubs
          </Link>
          <Link to="/addplayer" className="mr-4 text-white text-sm sm:text-md cursor-pointer">
            Add Player
          </Link>
          <Link to="/matches" className="mr-4 text-white text-sm sm:text-md cursor-pointer">
            Matches
          </Link>
        </div>
      </header>
    </div>
  )
}

export default Header