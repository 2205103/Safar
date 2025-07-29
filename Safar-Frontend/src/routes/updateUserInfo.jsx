import React from 'react'
import UpdateUser from "../components/UpdateUser"

function updateUserInfo({user_id}) {
  return (
    <div>
      <UpdateUser user_id={user_id} />
    </div>
  )
}

export default updateUserInfo