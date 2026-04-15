'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import UploadZone from '@/components/UploadZone'
import ThemeToggle from '@/components/ThemeToggle'
import SessionBadge from '@/components/SessionBadge'
import AISettingsPanel from '@/components/AISettingsPanel'

interface Document {
  id: string
  filename: string
  char_count: number
  created_at: string
}

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = useCallback(async () => {
    try {
      const { data } = await api.get('/documents/')
      setDocuments(data)
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este documento?')) return
    await api.delete(`/documents/${id}`)
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  const handleCreateDemo = async () => {
    const { data } = await api.post('/documents/demo')
    await fetchDocuments()
    router.push(`/chat/${data.id}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_email')
    window.dispatchEvent(new Event('sessionchange'))
    router.push('/login')
  }

  const totalChars = documents.reduce((sum, doc) => sum + doc.char_count, 0)

  return (
    <main className='page-fade min-h-screen px-4 py-6 sm:px-8'>
      <div className='mx-auto w-full max-w-5xl'>
        <nav className='panel rise-in flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4'>
          <div>
            <h1 className='text-xl font-extrabold text-[#115e59]'>DocuSense</h1>
            <p className='text-xs text-[var(--text-soft)]'>Panel de documentos</p>
          </div>
          <div className='flex items-center gap-2'>
            <SessionBadge />
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className='btn-ghost px-4 py-2 text-sm font-semibold text-[#7f3b24] hover:border-[#ddad97]'
            >
              Cerrar sesion
            </button>
          </div>
        </nav>

        <section className='stagger-in mt-5 grid gap-4 sm:grid-cols-3'>
          <article className='panel-muted p-4'>
            <p className='text-xs uppercase tracking-[0.12em] text-[#4f6572]'>Documentos</p>
            <p className='mt-2 text-2xl font-bold text-[#14212a]'>{documents.length}</p>
          </article>
          <article className='panel-muted p-4'>
            <p className='text-xs uppercase tracking-[0.12em] text-[#4f6572]'>Caracteres</p>
            <p className='mt-2 text-2xl font-bold text-[#14212a]'>{totalChars.toLocaleString()}</p>
          </article>
          <article className='panel-muted p-4'>
            <p className='text-xs uppercase tracking-[0.12em] text-[#4f6572]'>Estado</p>
            <p className='mt-2 text-sm font-semibold text-[#115e59]'>Sistema listo para consultas</p>
          </article>
        </section>

        <section className='panel rise-in mt-5 p-4 sm:p-6'>
          <h2 className='mb-3 text-lg font-bold text-[#14212a]'>Subir nuevo PDF</h2>
          <UploadZone onUploadSuccess={fetchDocuments} />
          <div className='mt-4 rounded-2xl border border-dashed border-[#c8b79d] bg-[#fff8ee] p-4 text-sm text-[var(--text-soft)]'>
            <p className='font-semibold text-[var(--text-main)]'>Prueba rapida</p>
            <p className='mt-1'>
              Si quieres validar el sistema sin subir nada, crea un documento demo con dos preguntas sugeridas.
            </p>
            <button onClick={handleCreateDemo} className='btn-primary mt-3 px-4 py-2 text-sm'>
              Crear documento de prueba
            </button>
          </div>
        </section>

        <div className='mt-5'>
          <AISettingsPanel />
        </div>

        <section className='panel rise-in mt-5 p-4 sm:p-6'>
          <h2 className='mb-4 text-lg font-bold text-[#14212a]'>Mis documentos</h2>

          {loading && (
            <p className='text-sm text-[#6f8491]'>Cargando...</p>
          )}

          {!loading && documents.length === 0 && (
            <p className='text-sm text-[#6f8491]'>No tienes documentos aun.</p>
          )}

          <ul className='space-y-3'>
            {documents.map((doc) => (
              <li
                key={doc.id}
                className='rounded-2xl border border-[#d6ccbc] bg-[#fffaf1] p-4 transition-all hover:-translate-y-[1px] hover:border-[#b8aa95]'
              >
                <div className='flex flex-wrap items-center justify-between gap-4'>
                  <div>
                    <p className='font-semibold text-[#14212a]'>{doc.filename}</p>
                    <p className='mt-1 text-xs text-[#607684]'>
                      {doc.char_count.toLocaleString()} caracteres ·{' '}
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className='flex gap-2'>
                    <button
                      onClick={() => router.push(`/chat/${doc.id}`)}
                      className='btn-primary px-4 py-2 text-sm'
                    >
                      Chatear
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className='btn-ghost px-4 py-2 text-sm text-[#9f3f1f] hover:border-[#e4baa6]'
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}