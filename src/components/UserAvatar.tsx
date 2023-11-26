import { User } from 'next-auth'

type TUserAvatar = {
  user: Pick<User, 'name' | 'image'>
}

const UserAvatar = ({ user }: TUserAvatar) => {
  return (
    <div>UserAvatar</div>
  )
}

export default UserAvatar
