"use client"

import { useState } from "react";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { CommentRequest } from "@/lib/validators/comment";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ICreateComment {
  postId: string;
  replyToId?: string;
}

const CreateComment = ({ postId, replyToId }: ICreateComment) => {
  const [input, setInput] = useState<string>("");
  const on_change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }
  const router = useRouter();

  const { loginToast } = useCustomToast();

  const mutationFn = async ({ postId, text, replyToId }: CommentRequest) => {
    const payload: CommentRequest = { postId, text, replyToId }
    const { data } = await axios.patch(`/api/subreddit/post/comment`, payload);
    return data;
  }

  const onSuccess = () => {
    router.refresh();
    setInput("");
  }

  const onError = (err: Error) => {
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        return loginToast();
      }
    }
    return toast({ title: '😓 There was a problem', description: 'Something went wrong, please try again later', variant: 'destructive' });
  }

  const { mutate, isLoading, } = useMutation({ mutationFn, onSuccess, onError });

  const on_click = () => {
    mutate({ postId, text: input, replyToId });
  }

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Comment</Label >
      <div className="mt-2">
        <Textarea id="comment" value={input} onChange={on_change} rows={1} placeholder="What are your thoughts?" />
        <div className="mt-2 flex justify-end">
          <Button isLoading={isLoading} disabled={input.length === 0} onClick={on_click}>Post</Button>
        </div>
      </div>
    </div>
  )
}

export default CreateComment
