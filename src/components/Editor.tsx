"use client"

import { useForm } from 'react-hook-form';
import TextAreaAutosize from 'react-textarea-autosize';
import { zodResolver } from '@hookform/resolvers/zod';
import { PostCreationRequest, PostValidator } from '@/lib/validators/post';
import { useCallback, useRef, useState, useEffect, Ref } from 'react'
import type EditorJS from '@editorjs/editorjs'
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';


type TEdit = {
  subredditId: string;
}

const Editor = ({ subredditId }: TEdit) => {
  const { register, handleSubmit, formState } = useForm<PostCreationRequest>({ resolver: zodResolver(PostValidator), defaultValues: { subredditId, title: '', content: null } });

  const ref = useRef<EditorJS>();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true);
    };
  }, []);

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default
    const Header = (await import('@editorjs/header')).default
    const Embed = (await import('@editorjs/embed')).default
    const Table = (await import('@editorjs/table')).default
    const List = (await import('@editorjs/list')).default
    const Code = (await import('@editorjs/code')).default
    const LinkTool = (await import('@editorjs/link')).default
    const InlineCode = (await import('@editorjs/inline-code')).default
    const ImageTool = (await import('@editorjs/image')).default

    if (!ref.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          ref.current = editor
        },
        placeholder: 'Type here to write your post...',
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link',
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  // upload to uploadthing
                  try {
                    const res = await uploadFiles('imageUploader', { files: [file] })
                    const response: any = res[0]
                    return {
                      success: 1,
                      file: {
                        url: response.url,
                      },
                    }
                  } catch (error) {
                    console.log(`🕣%cEditor.tsx:73 - error`, 'font-weight:bold; background:#ae5100;color:#fff;');
                    console.log(error);
                    return {
                      success: 0,
                      file: {
                        url: "",
                      },
                    }
                  }
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      })
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();
      setTimeout(() => {
        // set focus the title
        _titleRef.current?.focus();
      }, 0)
    }
    if (isMounted) {
      init();
      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor])

  const { mutate } = useMutation({
    mutationFn: async ({ title, content, subredditId }: PostCreationRequest) => {
      const payload: PostCreationRequest = { subredditId, title, content };

      const { data } = await axios.post('/api/subreddit/post/create', payload);
      return data;
    },
    onError: () => {
      return toast({ title: 'Something went wrong', description: 'Your post was not published, please try again later', variant: 'destructive' });
    },
    onSuccess: () => {
      // r/mycommunity/submit into r/mycommunity
      const newPathname = pathname?.split('/').slice(0, -1).join('/');
      router.push(newPathname || '/');

      router.refresh();
      return toast({ description: 'Your post has been published.' })
    }
  });

  const { ref: titleRef, ...rest } = register('title');
  const text_ref = (ref: Ref<HTMLTextAreaElement>) => {
    titleRef(ref)
    // @ts-ignore
    _titleRef.current = ref
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true);
    }
  }, []);
  useEffect(() => {
    if (Object.keys(formState.errors).length > 0) {
      for (const [_key, value] of Object.entries(formState.errors)) {
        toast({ title: 'Something went wrong', description: (value as { message: string }).message, variant: 'destructive' });
      }

    }
  }, [formState.errors])
  const handle_submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(onSubmit)();
  }

  const onSubmit = async (data: PostCreationRequest) => {
    const blocks = await ref.current?.save();

    const payload: PostCreationRequest = {
      title: data.title,
      content: blocks,
      subredditId,
    }

    mutate(payload); // NOTE: create post
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <form id='subreddit-post-form' className="w-fit" onSubmit={handleSubmit(onSubmit)}>
        <div className="prose prose-stone dark:prose-invert">
          <TextAreaAutosize ref={(e: Ref<HTMLTextAreaElement> | any) => text_ref(e)} {...rest} placeholder="Title" className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none" />
          <div id='editor' className="min-h-[500px]" />
        </div>
      </form>
    </div>
  )
}

export default Editor
