"use client"

import { useRef } from "react";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import Post from "@/components/Post";

type TPostFeed = {
  initialPosts: ExtendedPost[];
  subredditName?: string;
};

const PostFeed = ({ initialPosts, subredditName }: TPostFeed) => {
  const { current } = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({ root: current, threshold: 1 });

  const infinite_query = async ({ pageParam = 1 }) => {
    const query = `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}${(!!subredditName) && `&subredditName=${subredditName}`}`;
    const { data } = await axios.get(query);
    return data as ExtendedPost[];
  }

  const getNextPageParam = (_: unknown, pages: any) => {
    return pages.length + 1;
  }

  const initialData = { pages: [initialPosts], pageParams: [1] };

  const { data: session } = useSession();
  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(['infinite-query'], infinite_query, { getNextPageParam, initialData });
  const posts = data?.pages.flatMap((page: any) => page) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        const votesAmt = post.votes.reduce((acc: number, vote: any) => {
          if (vote.type === 'UP') return acc + 1;
          if (vote.type === 'DOWN') return acc - 1;
          return acc;

        }, 0);
        const currentVote = post.votes.find((vote: any) => vote.userId === session?.user.id);
        if (index === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post post={post} subredditName={post.subreddit.name} commentAmt={post.comments.length} currentVote={currentVote} votesAmt={votesAmt} />
            </li>
          )
        } else {
          return (
            <Post post={post} subredditName={post.subreddit.name} commentAmt={post.comments.length} currentVote={currentVote} votesAmt={votesAmt} />
          )
        }

      })}
    </ul>
  )
}


export default PostFeed
