"use client"

import { useRef } from "react";
import type { Comment, User, CommentVote } from "@prisma/client";
import UserAvatar from "@/components/UserAvatar";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "@/components/CommentVotes";
import { Button } from "@/components/ui/Button";
import { MessageSquare } from "lucide-react";

type ExtendedComment = (Comment & { votes: CommentVote[]; author: User; });

type TPostComment = {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: CommentVote | undefined;
  postId: string;

}

const PostComment = ({ comment, currentVote, votesAmt }: TPostComment) => {
  const commentRef = useRef<HTMLDivElement>(null);
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

      <div className="flex gap-2 items-center">
        <CommentVotes commentId={comment.id} initialVoteAmt={votesAmt} initialVote={currentVote} />
        <Button variant="ghost" size="xs">
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>
      </div>

    </div>
  )
}

export default PostComment
