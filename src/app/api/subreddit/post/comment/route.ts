import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { CommentValidator } from "@/lib/validators/comment";

export const PATCH = async (req: Request) => {
  try {
    const body = await req.json();
    const { postId, text, replyToId } = CommentValidator.parse(body);
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await db.comment.create({ data: { text, postId, authorId: session.user.id, replyToId } });
    return new Response("✅ Comment created successfully", { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 400 });
    }

    return new Response("Could not create comment, please try again later", { status: 500 });
  }

}
