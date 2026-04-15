'use client'

import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

function setTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  window.dispatchEvent(new Event('themechange'))
}

function getSnapshot(): Theme {
  if (typeof window === 'undefined') return 'light'

  const saved = localStorage.getItem('theme') as Theme | null
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = saved ?? (systemDark ? 'dark' : 'light')

  if (document.documentElement.getAttribute('data-theme') !== theme) {
    document.documentElement.setAttribute('data-theme', theme)
  }

  return theme
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = () => onStoreChange()

  window.addEventListener('storage', onChange)
  window.addEventListener('themechange', onChange)
  media.addEventListener('change', onChange)

  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener('themechange', onChange)
    media.removeEventListener('change', onChange)
  }
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light')

  const handleToggle = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
  }

  return (
    <button
      onClick={handleToggle}
      className='btn-ghost inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold'
      aria-label='Cambiar tema'
      type='button'
    >
      <span>{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
    </button>
  )
}
