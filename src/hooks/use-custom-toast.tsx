import { toast } from '@/hooks/use-toast'
import { buttonVariants } from '@/components/ui/Button'
import Link from 'next/link';

export const useCustomToast = () => {
  const loginToast = () => {
    // const actions = (<Link href="/sign-in" onClick={dismiss} className={buttonVariants({ variant: 'outline' })}>Login</Link>);
    const { dismiss } = toast({
      title: 'login required', description: 'You need to be logged in to do that.', variant: 'destructive', action: (<Link href="/sign-in" onClick={() => dismiss()} className={buttonVariants({ variant: 'outline' })}>Login</Link>),
    })
  }
  return { loginToast }
}
