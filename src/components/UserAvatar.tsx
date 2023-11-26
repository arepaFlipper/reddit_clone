import { User } from 'next-auth'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import Image from 'next/image'
import { Icons } from '@/components/Icons'
import { AvatarProps } from '@radix-ui/react-avatar'


interface TUserAvatar extends AvatarProps {
  user: Pick<User, 'name' | 'image'>
}

const UserAvatar = ({ user, ...props }: TUserAvatar) => {
  return (
    <Avatar {...props}>
      {(user.image) ? (
        <div className='relative aspect-square h-full w-full'>
          <Image fill src={user.image} alt='profile picture' referrerPolicy='no-referrer' />
        </div>
      ) : (
        <AvatarFallback>
          <span className='sr-only'>{user?.name}</span>
          <Icons.user className='h-4 w-4' />
        </AvatarFallback>
      )
      }
    </Avatar >
  )
}

export default UserAvatar
