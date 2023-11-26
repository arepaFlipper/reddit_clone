import { User } from 'next-auth'
import React from 'react'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import UserAvatar from '@/components/UserAvatar'

type TUserAccountNav = {
  user: Pick<User, 'name' | 'image' | 'email'>
}

const UserAccountNav = ({ user }: TUserAccountNav) => {
  return (
    <DropdownMenu >
      <DropdownMenuTrigger>
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
    </DropdownMenu>
  )
}

export default UserAccountNav
