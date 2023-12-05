"use client"

import axios, { AxiosError } from "axios"
import { CommentVoteRequest } from "@/lib/validators/vote";
import { useState } from "react";
import { VoteType, CommentVote } from "@prisma/client";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { Button } from "@/components/ui/Button";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

type TCommentVote = {
  commentId: string;
  initialVoteAmt: number;
  initialVote?: Pick<CommentVote, "type">
}

const CommentVotes = ({ commentId, initialVoteAmt, initialVote }: TCommentVote) => {
  const { loginToast } = useCustomToast();
  const [votesAmt, setVotesAmt] = useState<number>(initialVoteAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);

  const prev_vote = usePrevious(currentVote);

  const mutationFn = async (voteType: VoteType) => {
    const payload: CommentVoteRequest = {
      voteType,
      commentId,
    }
    await axios.patch('/api/subreddit/post/comment/vote', payload);
  }

  const onError = (err: Error, voteType: VoteType) => {

    if (voteType === "UP") {
      setVotesAmt((prev) => prev - 1);
    } else {
      setVotesAmt((prev) => prev + 1);
    }

    // NOTE: reset the current vote
    setCurrentVote(prev_vote);

    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        return loginToast();
      }
    }

    return toast({ title: '😓 Something went wrong', description: 'Please try again later', variant: 'destructive' });

  }

  const onMutate = (type: VoteType) => {
    if (currentVote?.type === type) {
      // NOTE: User is voting the same way again, so remove their vote
      setCurrentVote(undefined)
      const vote_mutation: number = (type === 'UP') ? -1 : 1
      setVotesAmt((prev) => prev + 1)
    } else {
      // NOTE: User is voting in the opposite direction, so subtract 2
      setCurrentVote({ type });
      if (type === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
      else if (type === 'DOWN')
        setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
    }
  };

  const { mutate } = useMutation({
    mutationFn,
    onError,
    onMutate,
  })
  return (
    <div className="flex gap-1">
      <Button onClick={() => mutate('UP')} size="sm" variant='ghost' aria-label='upvote'>
        <ArrowBigUp className={cn('h-5 w-5 text-zinc-700', { 'text-emerald-500 fill-emerald-500': currentVote?.type === 'UP' })} />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmt}
      </p>
      <Button onClick={() => mutate('DOWN')} size="sm" variant="ghost" aria-label="downvote">
        <ArrowBigDown className={cn('h-5 w-5 text-zinc-700', { 'text-red-500 fill-red-500': currentVote?.type === "DOWN" })} />
      </Button>
    </div>
  )
}

export default CommentVotes;
