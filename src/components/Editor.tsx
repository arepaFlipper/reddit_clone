"use client"

import TextAreaAutosize from 'react-textarea-autosize';
type Props = {}

const Editor = (props: Props) => {
  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <form id='subreddit-post-form' className="w-fit" onSubmit={() => { }}>
        <div className="prose prose-stone dark:prose-invert">
          <TextAreaAutosize placeholder="Title" className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none" />
        </div>
      </form>
    </div>
  )
}

export default Editor
