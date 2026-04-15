import {
  readAiSettings,
} from '@/lib/aiSettings'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export async function streamChat(
  docId: string,
  message: string,
  history: ChatTurn[],
  onChunk: (text: string) => void,
  onDone: () => void
) {
  const token = localStorage.getItem('token')
  const settings = readAiSettings()

  const providerConfig = settings.useProjectKey
    ? {
        provider: settings.provider,
        model: settings.model,
        use_project_key: true,
      }
    : {
        provider: settings.provider,
        model: settings.model,
        api_key: settings.apiKey,
        use_project_key: false,
      }

  const res = await fetch(`${API_URL}/chat/${docId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message, history, provider_config: providerConfig }),
  })

  if (!res.ok) {
    let message = 'Error al conectar con el servidor'
    try {
      const payload = await res.json()
      message = payload?.detail?.message || payload?.detail || payload?.message || message
    } catch {
      // keep default message
    }

    throw new Error(message)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const processEvent = (rawEvent: string) => {
    const lines = rawEvent.split('\n')
    const dataParts: string[] = []

    for (const line of lines) {
      if (!line.startsWith('data:')) continue

      let value = line.slice(5)
      if (value.startsWith(' ')) {
        value = value.slice(1)
      }
      dataParts.push(value)
    }

    if (dataParts.length === 0) return

    const payload = dataParts.join('\n')

    // The current backend emits newline tokens as empty `data:` events.
    // Map them back to a line break so markdown structure is preserved.
    onChunk(payload === '' ? '\n' : payload)
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')

    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const rawEvent of events) {
      processEvent(rawEvent)
    }
  }

  const trailing = decoder.decode()
  if (trailing) {
    buffer += trailing.replace(/\r\n/g, '\n')
  }

  if (buffer.trim() !== '') {
    processEvent(buffer)
  }

  onDone()
}