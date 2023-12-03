import { redis } from '@/lib/redis';
import { CachedPost } from '@/types/redis';
import { Post, Vote, User } from "@prisma/client";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buttonVariants } from '@/components/ui/Button';
import { ArrowBigUp, Loader2, ArrowBigDown } from "lucide-react";
import PostVoteServer from "@/components/post-vote/PostVoteServer";

interface IPage {
  params: {
    postId: string;
  };
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const page = async ({ params }: IPage) => {
  const cachedPost = (await redis.hgetall(`post:${params.postId}`)) as CachedPost;
  let post: (Post & { votes: Vote[]; author: User; }) | null = null;

  if (!cachedPost) {
    post = await db.post.findFirst({
      where: {
        id: params.postId,
      },
      include: {
        votes: true,
        author: true,
      }
    })
  }

  const getData = async () => {
    return await db.post.findUnique({
      where: {
        id: params.postId,
      },
      include: {
        votes: true,
      },
    });
  }

  if (!post && !cachedPost) {
    return notFound();
  }
  return (
    <div>
      <div className="h-full flex flex-col sm:flex-row items-center sm:times-start justify-between">
        <Suspense fallback={<PostVoteShell />} >
          <PostVoteServer postId={post?.id ?? cachedPost.id} getData={getData} />
        </Suspense>
      </div>
    </div>
  )
}

const PostVoteShell = () => {
  return (
    <div className="flex items-center flex-col pr-6 w-20">

      {/* upvote */}
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigUp className="h-5 w-5 text-zinc-700" />
      </div>

      {/* score */}
      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>

      {/* downvote */}
      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <ArrowBigDown className="h-5 w-5 text-zinc-700" />
      </div>
    </div>
  )
}

export default page
