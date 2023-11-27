"use client"

import { Session } from "next-auth"
import { useRouter, usePathname } from 'next/navigation';
import UserAvatar from "./UserAvatar"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { ImageIcon, Link2 } from "lucide-react"

type TMiniCreatePost = {
  session: Session | null;
}

const MiniCreatePost = ({ session }: TMiniCreatePost) => {
  const router = useRouter()
  const pathname = usePathname();
  const onClick_handler = () => {
    router.push(`${pathname}/submit`);
  }
  return (
    <li className="overflow-hidden rounded-md bg-white shadow">
      <div className="h-full px-6 py-4 sm:flex sm:justify-between sm:px-4">
        <div className="relative">
          <UserAvatar user={{ name: session?.user.name || null, image: session?.user.image || null }} />
          <span className="absolute bottom-0 right-0 rounded-full w-3 h-3 bg-green-500 outline outline-2 outline-white" />
        </div>

        <Input readOnly onClick={onClick_handler} placeholder="Create Post" />
        <Button variant="ghost" onClick={onClick_handler} >
          <ImageIcon className="text-zinc-600" />
        </Button>
        <Button variant="ghost" onClick={onClick_handler} >
          <Link2 className="text-zinc-600" />
        </Button>
      </div>
    </li>
  )
}

export default MiniCreatePost
