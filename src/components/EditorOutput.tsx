"use client"
import dynamic from 'next/dynamic';
import Image from 'next/image';

const editor_js = async () => (await import('editorjs-react-renderer')).default;
const Output = dynamic(editor_js, { ssr: false });

type TEditorOutput = {
  content: any
}

const style = {
  paragraph: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  }
}

const CustomImageRenderer = ({ data }: any) => {
  return (
    <div className="relative w-full min-h-[15rem]">
      <Image alt='image' className="object-contain" fill src={data.file.url} />
    </div>
  )
}

const CustomCodeRenderer = ({ data }: any) => {
  return (
    <pre className="gb-gray-800 rounded-md p-4">
      <code className="text-gray-100 text-sm">{data.code}</code>
    </pre>
  )
}

const renderers = {
  images: CustomImageRenderer,
  code: CustomCodeRenderer,
}

const EditorOutput = ({ content }: TEditorOutput) => {
  return (
    // @ts-expect-error
    <Output data={content} style={style} className='text-sm' renderers={renderers} />
  )
}

export default EditorOutput
