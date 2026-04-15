'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { AxiosError } from 'axios'
import api from '@/lib/api'
import ThemeToggle from '@/components/ThemeToggle'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const parseApiError = (err: unknown) => {
    const fallback = 'Error al registrarse. Revisa tus datos e intenta de nuevo.'
    const axiosErr = err as AxiosError<{ detail?: string | Array<{ msg?: string }> }>
    const detail = axiosErr.response?.data?.detail

    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length > 0) {
      const firstMsg = detail[0]?.msg
      if (firstMsg) return firstMsg
    }
    return fallback
  }

  const isStrongPassword = (password: string) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isStrongPassword(form.password)) {
      setError('La contrasena debe tener minimo 8 caracteres, 1 mayuscula y 1 numero.')
      setLoading(false)
      return
    }

    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user_name', form.name)
      localStorage.setItem('user_email', form.email)
      window.dispatchEvent(new Event('sessionchange'))
      router.push('/documents')
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='page-fade min-h-screen px-5 py-8 sm:px-8'>
      <div className='mx-auto mb-5 flex w-full max-w-5xl justify-end'>
        <ThemeToggle />
      </div>
      <div className='mx-auto flex min-h-[84vh] w-full max-w-5xl items-center justify-center'>
        <section className='panel grid w-full overflow-hidden sm:grid-cols-2'>
          <div className='stagger-in flex flex-col justify-between bg-[#f3e8d8] p-7 text-[#14212a] sm:p-9'>
            <div className='space-y-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-[#115e59]'>Empieza hoy</p>
              <h1 className='text-3xl font-extrabold leading-tight'>Crea tu espacio de analisis</h1>
              <p className='text-sm leading-relaxed text-[#415866]'>
                Guarda tus documentos y conversa con una IA enfocada en el contenido real de cada archivo.
              </p>
            </div>

            <div className='panel-muted mt-6 border-[#d7c7af] bg-[#fff6e7] p-4 text-sm text-[#4f6572]'>
              Puedes subir archivos PDF de hasta 10MB y revisar tus respuestas en historial.
            </div>
          </div>

          <div className='stagger-in p-7 sm:p-9'>
            <h2 className='text-2xl font-bold text-[var(--text-main)]'>Crear cuenta</h2>
            <p className='mt-2 text-sm text-[var(--text-soft)]'>Completa tus datos para continuar.</p>

            {error && (
              <p className='mt-5 rounded-lg border border-[#f7cfbf] bg-[#fff1ea] p-3 text-sm text-[#9f3f1f]'>{error}</p>
            )}

            <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-semibold text-[var(--text-main)]'>Nombre</label>
                <input
                  type='text'
                  required
                  className='input-base'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-semibold text-[var(--text-main)]'>Email</label>
                <input
                  type='email'
                  required
                  className='input-base'
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-semibold text-[var(--text-main)]'>Contrasena</label>
                <input
                  type='password'
                  required
                  minLength={8}
                  pattern='(?=.*[A-Z])(?=.*\d).{8,}'
                  title='Minimo 8 caracteres, al menos 1 mayuscula y 1 numero'
                  className='input-base'
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <p className='mt-1 text-xs text-[var(--text-soft)]'>Minimo 8 caracteres, 1 mayuscula y 1 numero.</p>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='btn-primary mt-2 w-full py-2.5 text-sm'
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <p className='mt-5 text-sm text-[var(--text-soft)]'>
              Ya tienes cuenta?{' '}
              <Link href='/login' className='font-semibold text-[#115e59] hover:text-[#0a4f4a]'>
                Inicia sesion
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}