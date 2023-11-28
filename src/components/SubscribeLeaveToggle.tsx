"use client"

import { Button } from '@/components/ui/Button'
import { useMutation } from '@tanstack/react-query'
import { SubscribeToSubredditPayload } from '@/lib/validators/subreddit';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';


type TSubscribeLeaveToggle = {
  subredditId: string;
  subredditName: string;
  isSubscribed: boolean;
}

const SubscribeLeaveToggle = ({ subredditId, subredditName, isSubscribed }: TSubscribeLeaveToggle) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const mutationFn = async () => {
    const payload: SubscribeToSubredditPayload = {
      subredditId,
    }
    const { data } = await axios.post('/api/subreddit/subscribe', payload);
    return data as string
  }

  const onSuccess = () => {
    startTransition(() => {
      router.refresh();

    })
    return toast({ title: 'Subscribed', description: `You are now subscribed to r/${subredditName}` })
  }

  const onError = (err: Error) => {
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        return loginToast();
      }
    }
    return toast({ title: 'There was a problem', description: 'Something went wrong, please try again later', variant: 'destructive' });
  }
  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn,
    onError,
    onSuccess
  })
  return (
    <>
      {(isSubscribed) ? (
        <Button className="w-full mt-1 mb-4">Leave Community</Button>
      ) : (
        <Button isLoading={isSubLoading} onClick={() => subscribe()} className="w-full mt-1 mb-4">Join to post </Button>
      )
      }
    </>
  )
}

export default SubscribeLeaveToggle
