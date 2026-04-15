'use client'

import { useState, useSyncExternalStore } from 'react'
import {
  AiSettings,
  canUseProjectKey,
  formatCooldownRemaining,
  getDefaultModel,
  getProjectKeyCooldownRemainingMs,
  readAiSettings,
  writeAiSettings,
} from '@/lib/aiSettings'

const PROVIDER_LABELS = {
  openai: 'OpenAI',
  deepseek: 'DeepSeek',
  claude: 'Claude',
}

interface Snapshot {
  settings: AiSettings
  cooldownMs: number
}

const SERVER_SNAPSHOT: Snapshot = {
  settings: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    apiKey: '',
    useProjectKey: false,
  },
  cooldownMs: 0,
}

let lastSnapshotKey = '__server__'
let lastSnapshot: Snapshot = SERVER_SNAPSHOT

function readSnapshot(): Snapshot {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT

  const rawSettings = localStorage.getItem('docusense:ai-settings') ?? ''
  const rawCooldown = localStorage.getItem('docusense:project-api:last-used-at') ?? ''
  const nextKey = `${rawSettings}::${rawCooldown}`
  if (nextKey === lastSnapshotKey) return lastSnapshot

  const settings = readAiSettings()
  const cooldownMs = getProjectKeyCooldownRemainingMs()

  lastSnapshotKey = nextKey
  lastSnapshot = { settings, cooldownMs }
  return lastSnapshot
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}

  const handleChange = () => onStoreChange()
  window.addEventListener('storage', handleChange)
  window.addEventListener('aisettingschange', handleChange)

  return () => {
    window.removeEventListener('storage', handleChange)
    window.removeEventListener('aisettingschange', handleChange)
  }
}

export default function AISettingsPanel() {
  const [saved, setSaved] = useState(false)

  const { settings, cooldownMs } = useSyncExternalStore(subscribe, readSnapshot, () => SERVER_SNAPSHOT)

  const handleProviderChange = (provider: AiSettings['provider']) => {
    const nextModel = settings.model === getDefaultModel(settings.provider)
      ? getDefaultModel(provider)
      : settings.model

    writeAiSettings({
      ...settings,
      provider,
      model: nextModel,
    })
  }

  const handleSave = () => {
    const normalized: AiSettings = {
      ...settings,
      model: settings.model.trim() || getDefaultModel(settings.provider),
      apiKey: settings.apiKey.trim(),
    }

    if (normalized.useProjectKey && !canUseProjectKey()) {
      setSaved(false)
      return
    }

    writeAiSettings(normalized)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  const projectKeyLocked = settings.useProjectKey && cooldownMs > 0

  return (
    <section className='panel rise-in p-4 sm:p-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-lg font-bold text-[var(--text-main)]'>Configuracion de IA</h2>
          <p className='mt-1 text-sm text-[var(--text-soft)]'>Tu clave se guarda solo en este navegador.</p>
        </div>
        <span className='rounded-full border border-[#d6ccbc] bg-[#fff7ea] px-3 py-1 text-xs font-semibold text-[#115e59]'>
          {PROVIDER_LABELS[settings.provider]}
        </span>
      </div>

      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        <label className='space-y-1 text-sm'>
          <span className='block font-semibold text-[var(--text-main)]'>Proveedor</span>
          <select
            className='input-base'
            value={settings.provider}
            onChange={(e) => handleProviderChange(e.target.value as AiSettings['provider'])}
          >
            <option value='openai'>OpenAI</option>
            <option value='deepseek'>DeepSeek</option>
            <option value='claude'>Claude</option>
          </select>
        </label>

        <label className='space-y-1 text-sm'>
          <span className='block font-semibold text-[var(--text-main)]'>Modelo</span>
          <input
            className='input-base'
            value={settings.model}
            onChange={(e) => writeAiSettings({ ...settings, model: e.target.value })}
            placeholder={getDefaultModel(settings.provider)}
          />
        </label>
      </div>

      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        <label className='space-y-1 text-sm'>
          <span className='block font-semibold text-[var(--text-main)]'>API key personal</span>
          <input
            className='input-base'
            type='password'
            value={settings.apiKey}
            onChange={(e) => writeAiSettings({ ...settings, apiKey: e.target.value })}
            disabled={settings.useProjectKey}
            placeholder='Pega tu propia clave'
          />
        </label>

        <div className='panel-muted p-4'>
          <label className='flex items-start gap-3 text-sm'>
            <input
              type='checkbox'
              checked={settings.useProjectKey}
              onChange={(e) => writeAiSettings({ ...settings, useProjectKey: e.target.checked })}
              className='mt-1 h-4 w-4 accent-[#0f766e]'
            />
            <span>
              <span className='block font-semibold text-[var(--text-main)]'>🔒 Usar API del Proyecto (Recomendado)</span>
              <span className='block text-xs leading-relaxed text-[var(--text-soft)]'>
                MÁS SEGURO. Sin exponer claves al servidor. Limitado a 5 requests cada 48 horas por usuario.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className='mt-4 rounded-2xl border border-[#d6ccbc] bg-[#fffaf1] p-4 text-sm text-[var(--text-soft)]'>
        <p className='font-semibold text-[var(--text-main)]'>🔐 Seguridad de API Keys</p>
        <p className='mt-2 leading-relaxed'>
          <span className='block font-semibold text-[var(--text-main)] mb-1'>API del Proyecto (Recomendado):</span>
          Las claves del proyecto se guardan en el servidor. Nunca las ves. Máximo 5 solicitudes cada 48 horas.
        </p>
        <p className='mt-2 leading-relaxed'>
          <span className='block font-semibold text-[var(--text-main)] mb-1'>Tu API Key Personal:</span>
          Se guarda SOLO en tu navegador. Si la proporcionas, se envía al servidor en HTTPS, se USA en ese momento, y se descarta. 
          Nunca se almacena en la BD.
        </p>
        <p className='mt-2 leading-relaxed text-[#9f3f1f]'>
          ⚠️ Si usas tu propia clave: No la compartas en equipos públicos. Es tu responsabilidad protegerla.
        </p>
        {projectKeyLocked && (
          <p className='mt-2 font-semibold text-[#9f3f1f]'>
            La clave del proyecto estara disponible de nuevo en {formatCooldownRemaining(cooldownMs)}.
          </p>
        )}
      </div>

      <div className='mt-4 flex flex-wrap items-center justify-end gap-3'>
        {saved && <span className='text-sm font-semibold text-[#115e59]'>Configuracion guardada</span>}
        <button type='button' onClick={handleSave} className='btn-primary px-4 py-2 text-sm'>
          Guardar configuracion
        </button>
      </div>
    </section>
  )
}
