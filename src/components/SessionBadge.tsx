'use client'

import { useSyncExternalStore } from 'react'

interface SessionInfo {
  displayName: string
  connected: boolean
}

const SERVER_SESSION: SessionInfo = {
  displayName: 'Sesion inactiva',
  connected: false,
}

let lastKey = '__server__'
let lastSnapshot: SessionInfo = SERVER_SESSION

function getSnapshot(): SessionInfo {
  if (typeof window === 'undefined') return SERVER_SESSION

  const token = localStorage.getItem('token')
  const name = localStorage.getItem('user_name')
  const email = localStorage.getItem('user_email')

  const nextKey = `${token ?? ''}|${name ?? ''}|${email ?? ''}`
  if (nextKey === lastKey) return lastSnapshot

  if (!token) {
    lastKey = nextKey
    lastSnapshot = SERVER_SESSION
    return lastSnapshot
  }

  lastKey = nextKey
  lastSnapshot = {
    displayName: name || email || 'Sesion activa',
    connected: true,
  }

  return lastSnapshot
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}

  const onChange = () => onStoreChange()
  window.addEventListener('storage', onChange)
  window.addEventListener('sessionchange', onChange)

  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener('sessionchange', onChange)
  }
}

export default function SessionBadge() {
  const session = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SESSION)

  return (
    <div className='panel-muted inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm'>
      <span
        className={`h-2.5 w-2.5 rounded-full ${session.connected ? 'bg-emerald-500' : 'bg-zinc-400'}`}
        aria-hidden='true'
      />
      <span className='font-semibold text-[var(--text-main)]'>
        {session.connected ? session.displayName : 'Sesion inactiva'}
      </span>
    </div>
  )
}
