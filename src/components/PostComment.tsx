"use client"

import { useRef, useState } from "react";
import type { Comment, User, CommentVote } from "@prisma/client";
import UserAvatar from "@/components/UserAvatar";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "@/components/CommentVotes";
import { Button } from "@/components/ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label } from "./ui/Label";
import axios, { AxiosError } from "axios";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { CommentRequest } from "@/lib/validators/comment";
import { Textarea } from "./ui/Textarea";

type ExtendedComment = (Comment & { votes: CommentVote[]; author: User; });

type TPostComment = {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: CommentVote | undefined;
  postId: string;

}

const PostComment = ({ comment, currentVote, votesAmt, postId }: TPostComment) => {
  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession()
  const [isReplying, setIsReplying] = useState<boolean>(false);

  const [input, setInput] = useState<string>("");

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

  const on_change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }

  const on_click = () => {
    if (!session) {
      return router.push('/sign-in');
    }
    setIsReplying(true);
  }

  const on_click_reply = () => {
    if (!input) {
      return mutate({ postId, text: input, replyToId: comment.replyToId ?? comment.id })
    }
    setIsReplying(true);
  }

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar user={{ name: comment.author.name || null, image: comment.author.image || null }} className="h-6 w-6" />
        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">u/{comment.author.name}</p>
          <p className="max-h-40 truncate text-xs text-zinc-500">{formatTimeToNow(new Date(comment.createdAt))}</p>
        </div>
      </div>
      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      <div className="flex gap-2 items-center flex-wrap">
        <CommentVotes commentId={comment.id} initialVoteAmt={votesAmt} initialVote={currentVote} />
        <Button onClick={on_click} variant="ghost" size="xs">
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>
        {isReplying && (
          <div className="grid w-full gap-1.5">
            <Label>Your comment</Label>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="comment">Comment</Label >
              <div className="mt-2">
                <Textarea id="comment" value={input} onChange={on_change} rows={1} placeholder="What are your thoughts?" />
                <div className="mt-2 flex justify-end">
                  <Button isLoading={isLoading} disabled={input.length === 0} onClick={on_click_reply}>Post</Button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  )
}

export default PostComment
