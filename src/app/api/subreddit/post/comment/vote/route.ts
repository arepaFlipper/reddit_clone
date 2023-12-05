import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { CommentVoteValidator } from '@/lib/validators/vote'
import { z } from 'zod'

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('🖕Unauthorized', { status: 401 })
    }

    // NOTE: check if user has already voted on this post
    const existingVote = await db.commentVote.findFirst({
      where: {
        userId: session.user.id,
        commentId,
      },
    })

    if (existingVote) {
      // NOTE: if vote type is the same as existing vote, delete the vote
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
        })

        return new Response('💥 Comment unvoted successfully ', { status: 200 })
      } else {
        // NOTE: if vote type is different, update the vote
        await db.commentVote.update({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
          data: {
            type: voteType,
          },
        })
        return new Response('🥳 Comment voted successfully ', { status: 200 })
      }
    }

    // NOTE: if no existing commentVote, create a new commentVote
    await db.commentVote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        commentId,
      },
    })

    return new Response('🙌 Comment voted successfully ', { status: 200 })
  } catch (error) {
    (error)
    if (error instanceof z.ZodError) {
      return new Response(`😵‍💫 Invalid request data: ${error.message}`, { status: 400 })
    }

    return new Response(
      '☠️  Could not comment to subreddit at this time. Please try later',
      { status: 500 }
    );
  }
}
