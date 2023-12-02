import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { PostVoteValidator } from '@/lib/validators/vote'
import { CachedPost } from '@/types/redis'
import { z } from 'zod'

const CACHE_AFTER_UPVOTES = 1

const recount_votes = async ({ post, voteType, postId }: any): Promise<{ votesAmt: number, cachePayload?: CachedPost }> => {

  // Recount the votes
  const votesAmt = post.votes.reduce((acc, vote) => {
    if (vote.type === 'UP') return acc + 1
    if (vote.type === 'DOWN') return acc - 1
    return acc
  }, 0)

  if (votesAmt >= CACHE_AFTER_UPVOTES) {
    const cachePayload: CachedPost = {
      authorUsername: post.author.username ?? '',
      content: JSON.stringify(post.content),
      id: post.id,
      title: post.title,
      currentVote: null,
      createdAt: post.createdAt,
    }

    await redis.hset(`post:${postId}`, cachePayload) // Store the post data as a hash
  }

  return { votesAmt };

}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const { postId, voteType } = PostVoteValidator.parse(body)

    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('🖕Unauthorized', { status: 401 })
    }

    // check if user has already voted on this post
    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    })

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    })

    if (!post) {
      return new Response('😰 Post not found', { status: 404 })
    }

    if (existingVote) {
      // if vote type is the same as existing vote, delete the vote
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id,
            },
          },
        })

        recount_votes({ post, voteType, postId })

        return new Response('💥 Post unvoted successfully ', { status: 200 })
      }

      // if vote type is different, update the vote
      await db.vote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      })

      recount_votes({ post, voteType, postId });

      return new Response('🥳 Post voted successfully ', { status: 200 })
    }

    // if no existing vote, create a new vote
    await db.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        postId,
      },
    })

    recount_votes({ post, voteType, postId });

    return new Response('🙌 Post voted successfully ', { status: 200 })
  } catch (error) {
    (error)
    if (error instanceof z.ZodError) {
      return new Response(`😵‍💫 Invalid request data: ${error.message}`, { status: 400 })
    }

    return new Response(
      '☠️  Could not post to subreddit at this time. Please try later',
      { status: 500 }
    );
  }
}
