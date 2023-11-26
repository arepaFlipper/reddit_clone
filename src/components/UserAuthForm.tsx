"use client"

import { useState } from "react"
import { Button } from "./ui/Button"
import { cn } from "@/lib/utils"
import { signIn } from "next-auth/react"
import { Icons } from "./Icons"

interface IUserAuthForm extends React.HTMLAttributes<HTMLDivElement> { }

const UserAuthForm = ({ className, ...props }: IUserAuthForm) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const loginWithGoogle = async () => {
    setIsLoading(true)

    try {
      await signIn('google')
    } catch (error) {
      // toast notification here
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className={cn('flex justify-center', className)}>
      <Button onClick={loginWithGoogle} isLoading={isLoading} size='sm' className='w-full'>
        {(isLoading) ? 'Loading...' : <Icons.google className="mr-2 h-4 w-4" />}
        Google
      </Button>
    </div>
  )
}

export default UserAuthForm
