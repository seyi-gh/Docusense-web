'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MessageBubble from '@/components/MessageBubble'
import { streamChat } from '@/lib/streaming'
import ThemeToggle from '@/components/ThemeToggle'
import SessionBadge from '@/components/SessionBadge'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function getConversationKey(docId: string) {
  return `docusense:chat:${docId}`
}

const EMPTY_MESSAGES: Message[] = []
const conversationCache = new Map<string, { raw: string; messages: Message[] }>()

function readConversation(docId: string): Message[] {
  if (typeof window === 'undefined') return EMPTY_MESSAGES

  const storageKey = getConversationKey(docId)
  const raw = localStorage.getItem(storageKey) ?? '[]'
  const cached = conversationCache.get(storageKey)
  if (cached?.raw === raw) return cached.messages

  let messages: Message[] = []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) {
      messages = parsed.filter(
        (msg): msg is Message =>
          Boolean(
            msg &&
              typeof msg === 'object' &&
              'role' in msg &&
              'content' in msg &&
              (msg as Message).role &&
              ((msg as Message).role === 'user' || (msg as Message).role === 'assistant') &&
              typeof (msg as Message).content === 'string'
          )
      )
    }
  } catch {
    messages = []
  }

  conversationCache.set(storageKey, { raw, messages })
  return messages
}

function subscribeConversation(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}

  const handleChange = () => onStoreChange()
  window.addEventListener('storage', handleChange)
  window.addEventListener('chatchange', handleChange)

  return () => {
    window.removeEventListener('storage', handleChange)
    window.removeEventListener('chatchange', handleChange)
  }
}

function writeConversation(docId: string, nextMessages: Message[]) {
  const storageKey = getConversationKey(docId)
  localStorage.setItem(storageKey, JSON.stringify(nextMessages))
  window.dispatchEvent(new Event('chatchange'))
}

export default function ChatPage() {
  const { docId } = useParams<{ docId: string }>()
  const router = useRouter()
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const messages = useSyncExternalStore(
    subscribeConversation,
    () => readConversation(docId),
    () => EMPTY_MESSAGES
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = '0px'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 170)}px`
  }, [input])

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || streaming) return

    const nextMessages = [...messages, { role: 'user', content: userMessage }]
    setInput('')
    writeConversation(docId, [...nextMessages, { role: 'assistant', content: '' }])
    setStreaming(true)

    try {
      await streamChat(
        docId,
        userMessage,
        nextMessages,
        (chunk) => {
          const currentConversation = readConversation(docId)
          const updated = [...currentConversation]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk,
          }
          writeConversation(docId, updated)
        },
        () => setStreaming(false)
      )
    } catch {
      const currentConversation = readConversation(docId)
      const updated = [...currentConversation]
      updated[updated.length - 1] = {
        role: 'assistant',
        content: 'Error al obtener respuesta. Intenta de nuevo.',
      }
      writeConversation(docId, updated)
      setStreaming(false)
    }
  }

  const handleSend = async () => {
    await sendMessage(input.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickPrompts = [
    'Resume el documento en 3 puntos.',
    'Cual es la principal limitacion actual del sistema?',
  ]

  const sendQuickPrompt = (prompt: string) => {
    setInput(prompt)
    void sendMessage(prompt)
  }

  return (
    <main className='page-fade flex h-screen flex-col px-3 py-3 sm:px-6 sm:py-5'>
      <nav className='panel rise-in flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4'>
        <button
          onClick={() => router.push('/documents')}
          className='btn-ghost px-3 py-2 text-sm font-semibold'
        >
          Volver
        </button>
        <div className='text-center'>
          <h1 className='text-lg font-bold text-[#115e59]'>DocuSense Chat</h1>
          <p className='text-xs text-[var(--text-soft)]'>Documento: {docId.slice(0, 8)}...</p>
        </div>
        <div className='flex items-center gap-2'>
          <SessionBadge />
          <ThemeToggle />
        </div>
      </nav>

      <div className='mx-auto mt-4 flex w-full max-w-4xl flex-1 flex-col overflow-hidden'>
        <section className='panel flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6'>
          <div className='mx-auto w-full max-w-3xl space-y-4'>
        {messages.length === 0 && (
              <div className='panel-muted mt-10 rounded-2xl p-4 text-center text-sm text-[var(--text-soft)]'>
                <p className='font-semibold text-[var(--text-main)]'>Prueba rapida de 1 documento</p>
                <p className='mt-1'>Haz dos preguntas para validar el flujo completo y ver el formato Markdown.</p>
                <div className='mt-4 flex flex-wrap justify-center gap-2'>
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type='button'
                      onClick={() => sendQuickPrompt(prompt)}
                      className='btn-ghost px-3 py-2 text-xs font-semibold'
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}

            <div ref={bottomRef} />
          </div>
        </section>
      </div>

      <div className='mx-auto mt-3 w-full max-w-4xl'>
        <div className='panel rise-in flex gap-3 px-3 py-3 sm:px-4'>
          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={1500}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming}
            placeholder='Escribe tu pregunta...'
            className='input-base min-h-[44px] flex-1 resize-none text-sm disabled:opacity-50'
          />
          <button
            onClick={handleSend}
            disabled={streaming || !input.trim()}
            className='btn-primary px-5 py-2 text-sm'
          >
            {streaming ? 'Pensando...' : 'Enviar'}
          </button>
        </div>
        <div className='mt-1 flex items-center justify-between px-1 text-xs text-[var(--text-soft)]'>
          <p>Enter para enviar, Shift+Enter para salto de linea</p>
          <p>{input.length}/1500</p>
        </div>
      </div>
    </main>
  )
}