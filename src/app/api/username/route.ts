import { getAuthSession } from "@/lib/auth";
import { UsernameValidator } from "@/lib/validators/username";
import { db } from "@/lib/db";
import { z } from "zod";

export const PATCH = async (req: Request) => {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("🖕Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { name } = UsernameValidator.parse(body);

    const username = await db.user.findFirst({
      where: {
        username: name,
      }
    });

    if (username) {
      return new Response("❌ Username already taken", { status: 409 });
    }

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: name,
      }
    })

    return new Response("✅ Username updated sucessfully", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(`❌ Invalid POST request data passed: ${error.issues[0].message}`, { status: 422 });
    }

    return new Response(`❌ Could not update username, ${error} \n Please try again later.`, { status: 500 });

  }
}
