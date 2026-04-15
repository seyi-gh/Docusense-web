'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import ThemeToggle from '@/components/ThemeToggle'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user_email', form.email)
      window.dispatchEvent(new Event('sessionchange'))
      router.push('/documents')
    } catch {
      setError('Credenciales inválidas')
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
          <div className='stagger-in flex flex-col justify-between bg-[#1d2a32] p-7 text-[#f6f2e9] sm:p-9'>
            <div className='space-y-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-[#bde4db]'>DocuSense</p>
              <h1 className='text-3xl font-extrabold leading-tight'>Bienvenido de nuevo</h1>
              <p className='text-sm leading-relaxed text-[#c9d7e0]'>
                Inicia sesion para retomar tus conversaciones con documentos y seguir analizando tus PDFs.
              </p>
            </div>

            <div className='panel-muted mt-6 border-[#345261] bg-[#233743] p-4 text-sm text-[#d5e2e8]'>
              Tus respuestas se generan en streaming para que no tengas que esperar al final.
            </div>
          </div>

          <div className='stagger-in p-7 sm:p-9'>
            <h2 className='text-2xl font-bold text-[var(--text-main)]'>Iniciar sesion</h2>
            <p className='mt-2 text-sm text-[var(--text-soft)]'>Accede con tu email y contrasena.</p>

            {error && (
              <p className='mt-5 rounded-lg border border-[#f7cfbf] bg-[#fff1ea] p-3 text-sm text-[#9f3f1f]'>{error}</p>
            )}

            <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
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
                  className='input-base'
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <button
                type='submit'
                disabled={loading}
                className='btn-primary mt-2 w-full py-2.5 text-sm'
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <p className='mt-5 text-sm text-[var(--text-soft)]'>
              No tienes cuenta?{' '}
              <Link href='/register' className='font-semibold text-[#115e59] hover:text-[#0a4f4a]'>
                Registrate
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}