import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  role: 'user' | 'assistant'
  content: string
}

export default function MessageBubble({ role, content }: Props) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm
          ${isUser
            ? 'rounded-br-sm border border-[#0d6861] bg-[#0f766e] text-white'
            : 'rounded-bl-sm border border-[#cfc4b4] bg-[#fff8ee] text-[#213744]'
          }`}
      >
        {content ? (
          isUser ? (
            content
          ) : (
            <div className='markdown-content'>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )
        ) : (
          <span className='animate-pulse text-[#6f8491]'>...</span>
        )}
      </div>
    </div>
  )
}