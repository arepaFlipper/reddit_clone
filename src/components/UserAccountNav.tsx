import { User } from 'next-auth'
import React from 'react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/DropdownMenu'
import UserAvatar from '@/components/UserAvatar'
import Link from 'next/link'

type TUserAccountNav = {
  user: Pick<User, 'name' | 'image' | 'email'>
}

const UserAccountNav = ({ user }: TUserAccountNav) => {
  return (
    <DropdownMenu >
      <DropdownMenuTrigger>
        <UserAvatar user={{ name: user.name || null, image: user.image || null, }} className='w-8 h-8' />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='bg-white' align='end'>
        <div className='flex items-center justify-start gap-2 p-2'>
          <div className='flex flex-col space-y-1 leading-none'>
            {(user.name) && (<p className='font-medium' >{user.name}</p>)}
            {(user.email) && (<p className='w-[200px] truncate text-sm text-zinc-700' >{user.email}</p>)}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={'/'} >Feed</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={'/r/create'} >Create Community</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={'/settings'} >Settings</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem className='cursor-pointer'>Sign out </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserAccountNav
