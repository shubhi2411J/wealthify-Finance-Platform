import { SignIn } from '@clerk/clerk-react'
import React from 'react'

const AuthLayout = () => {
  return (
    <div className='flex justify-center pt-40'>
      <SignIn/>
    </div>
  )
}

export default AuthLayout
