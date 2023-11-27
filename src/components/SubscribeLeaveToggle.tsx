import { Button } from '@/components/ui/Button'
type Props = {}

const SubscribeLeaveToggle = (props: Props) => {
  const isSubscribed = false;
  return (
    <>
      {(isSubscribed) ? <Button className="w-full mt-1 mb-4">Leave Community</Button> : <Button className="w-full mt-1 mb-4">Join to post </Button>}
    </>
  )
}

export default SubscribeLeaveToggle
