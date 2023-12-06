"use client"
import { UsernameRequest, UsernameValidator } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { User } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useMutation } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

type TUserNameForm = {
  user: Pick<User, "id" | "username">;
}

const UserNameForm = ({ user }: TUserNameForm) => {
  const { handleSubmit, register, formState: { errors } } = useForm<UsernameRequest>({ resolver: zodResolver(UsernameValidator), defaultValues: { name: user?.username || "" } });
  const router = useRouter();
  const mutationFn = async ({ name }: UsernameRequest) => {
    const payload: UsernameRequest = { name };
    const { data } = await axios.patch(`/api/username`, payload);
    return data;
  };

  const onSuccess = () => {
    toast({ description: "✅ Your username has been updated." });
    router.refresh();
  };

  const onError = (err: Error) => {
    if (err instanceof AxiosError) {
      if (err.response?.status === 409) {
        return toast({
          title: "This username is already taken.",
          description: "Please choose a different username.",
          variant: "destructive",
        });
      };
    };

    return toast({
      title: "There was an error.",
      description: "Could not create subreddit.",
      variant: "destructive",
    });
  };
  const { mutate, isLoading } = useMutation({ mutationFn, onSuccess, onError });
  return (
    <form onSubmit={handleSubmit((event: UsernameRequest) => { mutate(event) })}>
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>
            Please enter a display name you are comfortable with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='relative grid gap-1'>
            <div className='absolute top-0 left-0 w-8 h-10 grid place-items-center'>
              <span className='text-sm text-zinc-400'>u/</span>
            </div>
            <Label className='sr-only' htmlFor='name'>
              Name
            </Label>
            <Input
              id='name'
              className='w-[400px] pl-6'
              size={32}
              {...register('name')}
            />
            {errors?.name && (
              <p className='px-1 text-xs text-red-600'>{errors.name.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button isLoading={isLoading}>Change name</Button>
        </CardFooter>
      </Card>
    </form>
  )
}

export default UserNameForm
