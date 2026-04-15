'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import api from '@/lib/api'

interface Props {
  onUploadSuccess: () => void
}

export default function UploadZone({ onUploadSuccess }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo no puede superar 10MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post('/documents/upload', formData)
      onUploadSuccess()
    } catch {
      setError('Error al subir el archivo')
    } finally {
      setUploading(false)
    }
  }, [onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all sm:p-10
          ${isDragActive
            ? 'border-[#0f766e] bg-[#daf1ec] shadow-[0_14px_32px_rgba(15,118,110,0.22)]'
            : 'border-[#c7bdaF] bg-[#fffaf1] hover:border-[#2a897f] hover:bg-[#fff3df]'
          }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className='text-[#365668]'>Subiendo documento...</p>
        ) : isDragActive ? (
          <p className='font-semibold text-[#0f766e]'>Suelta el PDF aqui</p>
        ) : (
          <div>
            <p className='text-[#314d5d]'>Arrastra un PDF o haz clic para seleccionar</p>
            <p className='mt-1 text-xs text-[#6f8491]'>Maximo 10MB por archivo</p>
          </div>
        )}
      </div>

      {error && (
        <p className='mt-2 text-sm text-[#b84722]'>{error}</p>
      )}
    </div>
  )
}