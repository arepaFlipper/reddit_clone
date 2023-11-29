import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server";
import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  imageGuploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async (req: NextRequest) => {
      const user = await getToken({ req });

      if (!user) throw new Error("Unauthorized");

      return { userId: user.id }
    }).onUploadComplete(async ({ metadata, file }) => { }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter;
