import React from 'react'
import UserList from '../components/UserList'

const home = () => {
  return (
    <div>
      <center><h1 className="header-title">
        Passenger List
      </h1></center>
      <UserList />
    </div>
  )
}

export default home