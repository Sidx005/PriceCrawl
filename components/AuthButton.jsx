'use client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { LogInIcon, LogOut } from 'lucide-react'
import AuthModal from './AuthModal'
import { signOut } from '@/app/auth/actions'

const AuthButton = ({user}) => {
 const [showAuthModal,setShowAuthModal]=useState(false)
 if(user){
    return(  
    <form action={signOut}>
        <Button variant='ghost' size='sm' type='submit' className={'gap-2'}>
            <LogOut className='h-4 w-4'/>
            Sign Out
        </Button>
    </form>)
 }
 return (
    <>
     <Button onClick={()=>setShowAuthModal(true)} variant="default" size='lg'>
   <LogInIcon/>
        <p>Sign In</p>
        </Button>
        <AuthModal isOpen={showAuthModal} onClose={()=>setShowAuthModal(false)}/>
        </>
  )
}

export default AuthButton