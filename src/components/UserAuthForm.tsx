"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/Button"
import { cn } from "@/lib/utils"
import { signIn } from "next-auth/react"
import { Icons } from "./Icons"
import { useToast } from "@/hooks/use-toast"

interface IUserAuthForm extends React.HTMLAttributes<HTMLDivElement> { }

const UserAuthForm = ({ className, ...props }: IUserAuthForm) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { toast } = useToast()

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      await signIn('google')
    } catch (error) {
      // toast notification here
      toast({
        title: 'There was a problem',
        description: 'There was an error logging in with Google',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className={cn('flex justify-center', className)}>
      <Button onClick={loginWithGoogle} isLoading={isLoading} size='sm' className='w-full'>
        {(!isLoading) && <Icons.google className="mr-2 h-4 w-4" />}
        Google
      </Button>
    </div>
  )
}

export default UserAuthForm
